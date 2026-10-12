/**
 * WebRTC Client Engine: Manages RTCPeerConnection, STUN configuration,
 * Media Streams (Audio/Video), Screen Sharing, and Track replacements.
 */

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

export class WebRtcClient {
  constructor({ onRemoteStream, onIceCandidate, onConnectionStateChange }) {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.isScreenSharing = false;
    this.candidateQueue = [];

    this.onRemoteStream = onRemoteStream;
    this.onIceCandidate = onIceCandidate;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  /**
   * Initialize local camera and microphone media stream
   */
  async initLocalMedia({ audio = true, video = true } = {}) {
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access requires HTTPS or localhost. Please ensure a secure browser connection.');
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          : false,
        video: video
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
          : false
      });

      // If peer connection was already instantiated, attach tracks immediately
      if (this.peerConnection && this.localStream) {
        const senders = this.peerConnection.getSenders();
        this.localStream.getTracks().forEach((track) => {
          const alreadyAdded = senders.some((s) => s.track === track);
          if (!alreadyAdded) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      return this.localStream;
    } catch (err) {
      console.error('[WEBRTC_MEDIA_ERROR] Failed to get user media:', err);
      // Fallback: Try audio only if video camera fails or is blocked
      if (video) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });

          if (this.peerConnection && this.localStream) {
            const senders = this.peerConnection.getSenders();
            this.localStream.getTracks().forEach((track) => {
              const alreadyAdded = senders.some((s) => s.track === track);
              if (!alreadyAdded) {
                this.peerConnection.addTrack(track, this.localStream);
              }
            });
          }

          return this.localStream;
        } catch (audioErr) {
          throw new Error('Could not access microphone. Please check browser permissions.');
        }
      }
      throw err;
    }
  }

  /**
   * Create and configure the RTCPeerConnection
   */
  createPeerConnection() {
    if (this.peerConnection) return this.peerConnection;

    this.peerConnection = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS
    });

    // Handle ICE Candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Handle Remote Track arrival (both audio and video tracks)
    this.peerConnection.ontrack = (event) => {
      let stream = event.streams && event.streams[0];
      if (!stream) {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        if (!this.remoteStream.getTracks().includes(event.track)) {
          this.remoteStream.addTrack(event.track);
        }
        stream = this.remoteStream;
      } else {
        this.remoteStream = stream;
      }

      if (this.onRemoteStream) {
        this.onRemoteStream(stream);
      }
    };

    // Connection state logging
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (this.onConnectionStateChange && state) {
        this.onConnectionStateChange(state);
      }
      console.log(`[WEBRTC_STATE] Connection state: ${state}`);
    };

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    return this.peerConnection;
  }

  /**
   * Caller: Generate SDP Offer
   */
  async createOffer({ isAudioOnly = false } = {}) {
    if (!this.peerConnection) this.createPeerConnection();
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: !isAudioOnly
    });
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Callee: Handle incoming SDP Offer and Generate SDP Answer
   */
  async handleOfferAndCreateAnswer(offer) {
    if (!this.peerConnection) this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    await this.processCandidateQueue();

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Caller: Handle incoming SDP Answer
   */
  async handleAnswer(answer) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      await this.processCandidateQueue();
    }
  }

  /**
   * Add ICE Candidate received from remote peer (with queueing if remoteDescription not ready)
   */
  async addIceCandidate(candidate) {
    if (!candidate) return;
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WEBRTC_ICE_CANDIDATE_WARN]', err);
      }
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  /**
   * Process all queued ICE candidates once remote description is set
   */
  async processCandidateQueue() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WEBRTC_ICE_CANDIDATE_QUEUE_WARN]', err);
      }
    }
  }

  /**
   * Toggle Audio Mute
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle Video Camera
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Start / Stop Screen Sharing
   */
  async toggleScreenShare() {
    if (this.isScreenSharing) {
      this.stopScreenShare();
      return { isSharing: false, stream: this.localStream };
    }

    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      const screenTrack = this.screenStream.getVideoTracks()[0];

      // Replace current video track in RTCPeerConnection
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      }

      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      this.isScreenSharing = true;
      return { isSharing: true, stream: this.screenStream };
    } catch (err) {
      console.warn('[SCREEN_SHARE_CANCELLED_OR_FAILED]', err);
      return { isSharing: false, stream: this.localStream };
    }
  }

  /**
   * Stop Screen Share & restore camera track
   */
  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    if (this.localStream && this.peerConnection) {
      const cameraTrack = this.localStream.getVideoTracks()[0];
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack);
      }
    }

    this.isScreenSharing = false;
  }

  /**
   * Clean up all media tracks and close peer connection
   */
  cleanup() {
    this.stopScreenShare();
    this.candidateQueue = [];

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
