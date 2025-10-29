// Firestore utility functions for database operations
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, getFirestore, orderBy } from "firebase/firestore"
import { app } from "./firebase"
import type { Flight, Booking, User } from "./types"

const db = getFirestore(app)

// ============ FLIGHTS ============

export async function getFlights(): Promise<Flight[]> {
  try {
    const flightsCollection = collection(db, "flights")
    const snapshot = await getDocs(flightsCollection)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Flight[]
  } catch (error) {
    console.error("Error fetching flights:", error)
    throw error
  }
}

export async function getFlightById(flightId: string): Promise<Flight | null> {
  try {
    const flightDoc = doc(db, "flights", flightId)
    const snapshot = await getDoc(flightDoc)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Flight
    }
    return null
  } catch (error) {
    console.error("Error fetching flight:", error)
    throw error
  }
}

export async function searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
  try {
    const flightsCollection = collection(db, "flights")
    const q = query(flightsCollection, where("from", "==", from), where("to", "==", to), where("date", "==", date))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Flight[]
  } catch (error) {
    console.error("Error searching flights:", error)
    throw error
  }
}

export async function addFlight(flight: Omit<Flight, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const flightsCollection = collection(db, "flights")
    const docRef = await addDoc(flightsCollection, {
      ...flight,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding flight:", error)
    throw error
  }
}

export async function updateFlight(flightId: string, updates: Partial<Flight>): Promise<void> {
  try {
    const flightDoc = doc(db, "flights", flightId)
    await updateDoc(flightDoc, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating flight:", error)
    throw error
  }
}

export async function deleteFlight(flightId: string): Promise<void> {
  try {
    const flightDoc = doc(db, "flights", flightId)
    await deleteDoc(flightDoc)
  } catch (error) {
    console.error("Error deleting flight:", error)
    throw error
  }
}

// ============ BOOKINGS ============

export async function getBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsCollection = collection(db, "bookings")
    const q = query(bookingsCollection, where("userId", "==", userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[]
  } catch (error) {
    console.error("Error fetching bookings:", error)
    throw error
  }
}

export async function getReservedSeatsForFlight(flightId: string): Promise<string[]> {
  try {
    const bookingsCollection = collection(db, "bookings")
    const q = query(
      bookingsCollection, 
      where("flightId", "==", flightId),
      where("status", "in", ["confirmed", "pending"])
    )
    const snapshot = await getDocs(q)
    
    const reservedSeats: string[] = []
    snapshot.docs.forEach((doc) => {
      const booking = doc.data() as Booking
      if (booking.selectedSeats) {
        reservedSeats.push(...booking.selectedSeats)
      }
    })
    
    return reservedSeats
  } catch (error) {
    console.error("Error fetching reserved seats:", error)
    throw error
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const bookingsCollection = collection(db, "bookings")
    const q = query(bookingsCollection, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[]
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    throw error
  }
}

export async function getBookingsByFlight(flightId: string): Promise<Booking[]> {
  try {
    const bookingsCollection = collection(db, "bookings")
    const q = query(bookingsCollection, where("flightId", "==", flightId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[]
  } catch (error) {
    console.error("Error fetching bookings by flight:", error)
    throw error
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const bookingDoc = doc(db, "bookings", bookingId)
    const snapshot = await getDoc(bookingDoc)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Booking
    }
    return null
  } catch (error) {
    console.error("Error fetching booking:", error)
    throw error
  }
}

export async function createBooking(booking: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const bookingsCollection = collection(db, "bookings")
    const docRef = await addDoc(bookingsCollection, {
      ...booking,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
  try {
    const bookingDoc = doc(db, "bookings", bookingId)
    await updateDoc(bookingDoc, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    throw error
  }
}

export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await updateBooking(bookingId, { status: "cancelled" })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    throw error
  }
}

export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    const bookingDoc = doc(db, "bookings", bookingId)
    await deleteDoc(bookingDoc)
  } catch (error) {
    console.error("Error deleting booking:", error)
    throw error
  }
}

// ============ USERS ============

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = doc(db, "users", userId)
    const snapshot = await getDoc(userDoc)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as User
    }
    return null
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function createUser(userId: string, user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<void> {
  try {
    const userDoc = doc(db, "users", userId)
    await updateDoc(userDoc, {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).catch(() => {
      // If document doesn't exist, create it
      return addDoc(collection(db, "users"), {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userDoc = doc(db, "users", userId)
    await updateDoc(userDoc, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}