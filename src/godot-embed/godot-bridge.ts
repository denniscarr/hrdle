import { useEffect } from "react";

// Messages that can be sent to Godot
export const GODOT_MESSAGE = {
  INIT_RACE: "godot:init_race",
} as const;
export type GodotMessage = (typeof GODOT_MESSAGE)[keyof typeof GODOT_MESSAGE];

// Events dispatched from Godot that can be listened to in React
export const GODOT_EVENT = {
  RACE_INITIALIZED: "godot:race_initialized",
};
export type GodotEvent = (typeof GODOT_EVENT)[keyof typeof GODOT_EVENT];

export interface HorseData {
  name: string;
  nameAbbrev: string;
  color: string;
}

export interface RaceInitializedEvent {
  horseDatas: HorseData[];
}

export function sendGodotMessage(
  message: GodotMessage,
  arg1: string = "",
  arg2: string = "",
  arg3: string = "",
  arg4: string = "",
) {
  // console.log(`Attempting to send message to Godot: ${message}`);
  if (window.godot_handler) {
    window.godot_handler(message, arg1, arg2, arg3, arg4);
  } else {
    console.log("Godot instance not found.");
  }
}

export function useGodotListener<T>(
  event: GodotEvent,
  callback: (eventData: T) => void,
) {
  useEffect(() => {
    const safeCallback = (e: Event) => {
      const customEvent = e as CustomEvent;

      // On the Godot side, we convert the event detail to a JSON string before
      // sending the event. Here we validate and then convert it to a JS object.
      if (typeof customEvent.detail !== "string") {
        console.log("Invalid event");
        return;
      }

      try {
        const data = JSON.parse(customEvent.detail) as T;
        callback(data);
      } catch (err) {
        console.error("Could not parse Godot event data:", err);
      }
    };

    window.addEventListener(event, safeCallback);

    return () => {
      window.removeEventListener(event, safeCallback);
    };
  }, [callback, event]);
}
