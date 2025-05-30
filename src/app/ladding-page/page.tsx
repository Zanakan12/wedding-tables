// src/app/ladding-page/page.tsx
'use client'

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link'

interface FormData {
  name: string;
  email: string;
  guests: number;
  message: string;
}

export default function WeddingLandingPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', guests: 1, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'guests' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: intégrer la logique d'envoi (API route /services externes)
    console.log('RSVP data:', form);
    alert('Merci pour votre réponse !');
  };

  return (
    <>
      <Head>
        <title>Page de mariage de [Nom1] & [Nom2]</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css?family=Great+Vibes|Roboto:400,700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header
        className="w-full h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative flex flex-col items-center h-full text-white text-center px-4">
          <h1 className="text-6xl font-cursive mb-4 mt-25">Maita <br className='block md:hidden' /> &amp; <br className='block md:hidden'/>Gerard</h1>
          <p className="text-xl mb-2 mt-35">Bienvenue au mariage à notre mariage</p>
          <p className="text-lg">Le 20 septembre 2025 – Château de Versailles</p>
          <div className='bg-pink-400 rounded p-5 absolute bottom-5'>
           <Link href="/">
                 Trouver ma place
           </Link> 
          </div>
        </div>
        
      </header>

      <main className="max-w-3xl mx-auto py-16 px-4 space-y-16">
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Notre histoire</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac orci nec
            urna fermentum ullamcorper.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Détails de la cérémonie</h2>
          <p>Cérémonie à 15h au parc du Château.</p>
          <p>Réception à suivre au Grand Salon.</p>
          
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold">RSVP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Votre nom"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Votre e-mail"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="guests"
              placeholder="Nombre de personnes"
              required
              min={1}
              value={form.guests}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded"
            />
            <textarea
              name="message"
              placeholder="Un mot pour nous..."
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Envoyer
            </button>
          </form>
        </section>
      </main>

      <footer className="bg-gray-100 py-6 text-center">
        <p>&copy; 2025 [Nom1] &amp; [Nom2]. Tous droits réservés.</p>
      </footer>

      <style jsx global>{`
        body { margin: 0; font-family: 'Roboto', sans-serif; color: #333; }
        .font-cursive { font-family: 'Great Vibes', cursive; }
      `}</style>
    </>
  );
}