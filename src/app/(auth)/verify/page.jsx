'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons'
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { useAction } from '@/hooks/use-action';
import { verifyToken } from '@/app/(auth)/_action/verify_token';

export default function Verify({ params }) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter()

  useEffect(() => {

    const urlToken = window.location.search.split("=")[1];
    setToken(window.location.search.split("=")[1] || null);

  }, [])

  useEffect(() => {
    execute({ token })
  }, [token])


  const { execute } = useAction(verifyToken, {
    onSuccess: (data) => {
      toast.success('Email verified, Login to continue')
      router.replace("/login");
    },
    onError: (error) => {
      toast.error('Invalid or Expired activation link, New activation lik sent')
      router.replace({ pathname: "/login", query: { msg: 'invalid activation link' } });

    }
  })


  const verifyEmail = async () => {
    try {
      setLoading(true)


      const res = await axios.post('/api/v1/auth/verifyemail', { token: token })
        .then((data) => {
          console.log(data)
          toast.success('Email verified successfully, Login to continue')
          router.replace('/login')
        })

    } catch (error) {
      setError(true)
      toast.error('Invalid link or activation link is expired')
      router.replace('/forgot')
    } finally {
      setLoading(false)
    }
  }

  const resendLink = () => {
    toast.success('New activation link send to below email address')
    router.push('/login')
  }


  return (
    <></>
  )
}
