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

    this.onRemoteStream = onRemoteStream;
    this.onIceCandidate = onIceCandidate;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  /**
   * Initialize local camera and microphone media stream
   */
  async initLocalMedia({ audio = true, video = true } = {}) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false
      });
      return this.localStream;
    } catch (err) {
      console.error('[WEBRTC_MEDIA_ERROR] Failed to get user media:', err);
      // Fallback: Try audio only if video camera fails or is blocked
      if (video) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          return this.localStream;
        } catch (audioErr) {
          throw new Error('Could not access microphone or camera. Please check browser permissions.');
        }
      }
      throw err;
    }
  }

  /**
   * Create and configure the RTCPeerConnection
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS
    });

    // Handle ICE Candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Handle Remote Track arrival
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };

    // Connection state logging
    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
      console.log(`[WEBRTC_STATE] Connection state: ${this.peerConnection.connectionState}`);
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
  async createOffer() {
    if (!this.peerConnection) this.createPeerConnection();
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
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
    }
  }

  /**
   * Add ICE Candidate received from remote peer
   */
  async addIceCandidate(candidate) {
    if (this.peerConnection && candidate) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WEBRTC_ICE_CANDIDATE_WARN]', err);
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
