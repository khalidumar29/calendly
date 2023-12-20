"use client";
import { FreeSlot, calculateFreeSlots } from "@/utils/calderApi";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type User = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  accessToken?: string | null | undefined;
};

const getCalendarAvailability = async (accessToken: string) => {
  try {
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ id: "primary" }],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const calendars = response.data.calendars;
    const primaryCalendar = calendars.primary;

    const busySlots = primaryCalendar.busy || [];
    const freeSlots = calculateFreeSlots(busySlots);

    return { freeSlots, busySlots };
  } catch (error) {
    console.error("Error fetching calendar availability:", error);
    throw error;
  }
};

export default function Home() {
  const { data: session } = useSession();
  const [freeSlots, setFreeSlots] = useState<Array<FreeSlot>>([]);
  const [busySlots, setBusySlots] = useState<Array<FreeSlot>>([]);

  useEffect(() => {
    if (session) {
      const user = session?.user as User;
      if (user.accessToken) {
        getCalendarAvailability(user.accessToken).then((slots) => {
          setFreeSlots(slots.freeSlots);
          setBusySlots(slots.busySlots);
        });
      }
    }
  }, [session]);

  return (
    <div className='flex h-screen w-screen justify-center items-center'>
      {session ? (
        <div className='flex flex-col gap-2 '>
          <h1>{session?.user?.name}</h1>
          <h1>Free Slot</h1>
          {freeSlots.map((slot, i) => (
            <div key={i} className='flex flex-col gap-2'>
              {/* formate the time */}
              <div className='flex justify-center items-center capitalize gap-2'>
                <h2>{new Date(slot.start).toLocaleString()}</h2>
                <h1>to</h1>
                <h2>{new Date(slot.end).toLocaleString()}</h2>
              </div>
            </div>
          ))}
          <h1>Busy Slot</h1>
          {busySlots.map((slot, i) => (
            <div key={i} className='flex flex-col gap-2'>
              {/* formate the time */}
              <div className='flex justify-center items-center capitalize gap-2'>
                <h2>{new Date(slot.start).toLocaleString()}</h2>
                <h1>to</h1>
                <h2>{new Date(slot.end).toLocaleString()}</h2>
              </div>
            </div>
          ))}
          <button
            className='font font-medium capitalize bg-white text-sky-500 px-4 py-2 rounded-md'
            onClick={() => {
              signOut();
            }}
          >
            Log Out
          </button>
        </div>
      ) : (
        <button
          className='bg-white items-center text-sky-500 capitalize font-medium px-4 py-2 rounded-md flex space-x-2 gap-2'
          onClick={() => {
            signIn("google");
          }}
        >
          <Image src='/google.svg' width={24} height={24} alt='google image' />
          continue with google
        </button>
      )}
    </div>
  );
}
