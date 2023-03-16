import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  getDoc,
  doc,
  CollectionReference,
} from "firebase/firestore/lite";
const EloRating = require("elo-rating");

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
      data: [...currentPlayers.data, { name: newPlayerName, elo: 1000 }],
    });
  }
};

export const updateMatchHist = async (updates: matchHistRow[]) => {
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
      data: [...currentHist.data, ...updates],
    });
    //update elos using
    //https://www.npmjs.com/package/elo-rating?activeTab=explore
    const playerOne = currentPlayers.data.find(
      (player) => player.name === updates[0].playerOneName
    );
    const playerTwo = currentPlayers.data.find(
      (player) => player.name === updates[0].playerTwoName
    );

    //iteratively calculate elos for batch of games
    const shuffledUpdates = shuffle(updates); //as match hist update does not specify in what order games were won or lost, shuffle to try keep things fair
    let runningElos: any = {
      playerRating: playerOne.elo,
      opponentRating: playerTwo.elo,
    };
    //initialise as current elo
    for (const update of shuffledUpdates) {
      if (update.playerOneDidWin) {
        runningElos = EloRating.calculate(
          runningElos.playerRating,
          runningElos.opponentRating
        );
      } else {
        runningElos = EloRating.calculate(
          runningElos.playerRating,
          runningElos.opponentRating,
          false
        );
      }
      console.log(runningElos)
    }

    await write(mainCollect, config.playerDoc, {
      data: currentPlayers.data.map((player) => {
        if (player.name === playerOne.name) {
          return { ...playerOne, elo: runningElos.playerRating };
        }
        if (player.name === playerTwo.name) {
          return { ...playerTwo, elo: runningElos.opponentRating };
        }
        return player;
      }),
    });
  } else {
    console.log("there was an error fetching data");
  }
};

export const timestampToLocale = (ts: number) => {
  const date = new Date(ts); // Convert Unix timestamp to milliseconds and create new Date object
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


  return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}`;
};

function shuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}


export function generateHash() {
  let hash = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i++) {
    hash += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return hash;
}
