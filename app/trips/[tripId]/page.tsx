/* eslint-disable react/no-unescaped-entities */
import { auth } from "@/auth"
import TripDetailClient from "@/components/trip-detail"
import { prisma } from "@/lib/prisma"

export default async function TripDetail({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params

  const session = await auth()
  if (!session) {
    return <div>Vous n'êtes pas connecté</div>
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user?.id },
    include: { locations: true },
  })

  if (!trip) {
    return <div>Vous n'avez pas accès à cette page</div>
  }

  return <TripDetailClient trip={trip} />
}
