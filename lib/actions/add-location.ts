"use server"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "../prisma"

async function geocodeAddress(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`
  )

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error(`Adresse invalide ou non trouvée : "${address}"`)
  }

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}

export async function addLocation(formData: FormData, tripId: string) {
  const session = await auth()
  if (!session) {
    throw new Error("Vous n'êtes pas connecté")
  }

  const address = formData.get("address")?.toString()
  if (!address) {
    throw new Error("Adresse manquante")
  }

  const { lat, lng } = await geocodeAddress(address)

  const count = await prisma.location.count({
    where: { tripId },
  })

  await prisma.location.create({
    data: {
      locationTitle: address,
      lat,
      lng,
      tripId,
      order: count,
    },
  })

  redirect(`/trips/${tripId}`)
}
