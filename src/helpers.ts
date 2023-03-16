import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const EloRating = require("elo-rating");

import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  getDoc,
  doc,
  CollectionReference,
} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyDhJjDHOkhL4Mfq5O8jvHcnjdNAbYiZPmo",
  authDomain: "squashkeeper-8f601.firebaseapp.com",
  projectId: "squashkeeper-8f601",
  storageBucket: "squashkeeper-8f601.appspot.com",
  messagingSenderId: "1035659027084",
  appId: "1:1035659027084:web:e12c3bfa348c283d5fd1a9",
  measurementId: "G-R3ZWFFYNCX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const mainCollect = collection(db, "main");

type dataType = Record<string, string | number | (string | number)[]>;
export type playersRow = { name: string; elo: number };
type playersDocDataSchema = { data: playersRow[] };
export type matchHistRow = {
  playerOneName: string;
  playerTwoName: string;
  playerOneDidWin: boolean;
  unixTS: number;
  reportedBy: string;
};
type matchHistDocDataSchema = {
  data: matchHistRow[];
};

export const config = {
  playerDoc: "players",
  matchHistDoc: "matchHist",
};

const write = async (
  collection: CollectionReference,
  documentName: string,
  data: dataType
) => {
  await setDoc(doc(collection, documentName), data);
};

export const read = async (
  collection: CollectionReference,
  documentName: string
) => {
  const docSnap = await getDoc(doc(collection, documentName));
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
};

export const addNewPlayer = async (newPlayerName: string) => {
  const currentPlayers = await read(mainCollect, config.playerDoc);
  if (currentPlayers && Array.isArray(currentPlayers.data)) {
    await write(mainCollect, config.playerDoc, {
      data: [...currentPlayers.data, { name: newPlayerName, elo: 0 }],
    });
  }
};

export const updateMatchHist = async (update: matchHistRow) => {
  const currentHist = await read(mainCollect, config.matchHistDoc);
  const currentPlayers = await read(mainCollect, config.playerDoc);
  console.log("current hist", currentHist);
  console.log("current players", currentPlayers);
  if (
    currentHist &&
    Array.isArray(currentHist.data) &&
    currentPlayers &&
    Array.isArray(currentPlayers.data)
  ) {
    //update history
    write(mainCollect, config.matchHistDoc, {
      data: [...currentHist.data, update],
    });
    //update elos using
    //https://www.npmjs.com/package/elo-rating?activeTab=explore
    const playerOne = currentPlayers.data.find(
      (player) => player.name === update.playerOneName
    );
    const playerTwo = currentPlayers.data.find(
      (player) => player.name === update.playerTwoName
    );

    let result: any;
    if (update.playerOneDidWin) {
      result = EloRating.calculate(playerOne.elo, playerTwo.elo);
    } else {
      result = EloRating.calculate(playerOne.elo, playerTwo.elo, false);
    }
    await write(mainCollect, config.playerDoc, {
      data: currentPlayers.data.map((player) => {
        if (player.name === playerOne.name) {
          return { ...playerOne, elo: result.playerRating };
        }
        if (player.name === playerTwo.name) {
          return { ...playerTwo, elo: result.opponentRating };
        }
        return player;
      }),
    });
  } else {
    console.log("there was an error fetching data");
  }
};

export const timestampToLocale = (ts: number) => {
  const date = new Date(ts * 1000); // Convert Unix timestamp to milliseconds and create new Date object
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = monthsOfYear[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year} at ${hours}:${minutes}:${seconds}`;
};
