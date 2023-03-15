import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { matchHistRow, playersRow, config, read, mainCollect } from "./helpers";
import { DocumentData } from "firebase/firestore/lite";
import {
  MantineProvider,
  Text,
  Autocomplete,
  TextInput,
  NumberInput,
  Button,
} from "@mantine/core";

const EloRating = require("elo-rating");

function App() {
  //match update form
  const [user, setUser] = React.useState<string>(
    localStorage.getItem("squash-keeper-default-user") ?? ""
  );
  const [matchesUserWon, setMatchesUserWon] = React.useState<number>(0);
  const [matchesUserLost, setMatchesUserLost] = React.useState<number>(0);
  const [opponent, setOpponent] = React.useState<string>("");

  ///data display
  const [matchHistory, setMatchHistory] = React.useState<
    DocumentData | undefined
  >();
  const [eloRankings, setEloRankings] = React.useState<
    playersRow[] | undefined
  >();

  const handleUserChange = (newUser: string) => {
    localStorage.setItem("squash-keeper-default-user", newUser);
    setUser(newUser);
  };

  const getAndSetAllData = async () => {
    const currentPlayers = await read(mainCollect, config.playerDoc);
    const currentHist = await read(mainCollect, config.matchHistDoc);
    if (
      currentHist &&
      Array.isArray(currentHist) &&
      currentPlayers &&
      Array.isArray(currentPlayers)
    ) {
      //set current players for use by match update dropdown
      setEloRankings(currentPlayers.sort((a, b) => a.elo - b.elo));
      setMatchHistory(currentHist);
    }
  };
  getAndSetAllData();

  return (
    <div className="App">
      <MantineProvider withGlobalStyles withNormalizeCSS>
        {eloRankings && matchHistory ? (
          <>
            <Autocomplete
              value={user}
              onChange={(str) => handleUserChange(str)}
              data={eloRankings.map((row) => row.name)}
            />
            <Text>played</Text>
            <Autocomplete
              value={opponent}
              onChange={(str) => handleUserChange(str)}
              data={eloRankings.map((row) => row.name)}
            />
            <Text>and won</Text>

            <NumberInput
              value={matchesUserWon}
              onChange={(num) => setMatchesUserWon(num === "" ? 0 : num)}
            />
            <Text>and lost</Text>
            <NumberInput
              value={matchesUserWon}
              onChange={(num) => setMatchesUserWon(num === "" ? 0 : num)}
            />
            <Text>matches</Text>

            <Button>Submit</Button>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </MantineProvider>
    </div>
  );
}

export default App;
