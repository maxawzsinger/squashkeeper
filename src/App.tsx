import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  matchHistRow,
  playersRow,
  config,
  read,
  mainCollect,
  updateMatchHist,
  addNewPlayer,
} from "./helpers";
import { DocumentData } from "firebase/firestore/lite";
import {
  MantineProvider,
  Text,
  Autocomplete,
  TextInput,
  NumberInput,
  Button,
} from "@mantine/core";
import { EloTable } from "./EloTable";
import { MatchHistTable } from "./HistTable";
import { Layout } from "./Layout";
import { DialogPopover } from "./DialogPopover";

const EloRating = require("elo-rating");

function App() {
  //match update form
  const [user, setUser] = React.useState<string>(
    localStorage.getItem("squash-keeper-default-user") ?? ""
  );
  const [matchesUserWon, setMatchesUserWon] = React.useState<number>(0);
  const [matchesUserLost, setMatchesUserLost] = React.useState<number>(0);
  const [opponent, setOpponent] = React.useState<string>("");

  //diialog
  const [doShowDialog, setDoShowDialog] = React.useState<boolean>(false);
  const [dialogText, setDialogText] = React.useState<string>("");
  //add new player
  const [newPlayerName, setNewPlayerName] = React.useState<string>("");

  ///data display
  const [matchHistory, setMatchHistory] = React.useState<
    matchHistRow[] | undefined
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
    console.log("current hist", currentHist);
    console.log("current players", currentPlayers);
    if (
      currentHist &&
      Array.isArray(currentHist.data) &&
      currentPlayers &&
      Array.isArray(currentPlayers.data)
    ) {
      //set current players for use by match update dropdown
      setEloRankings(currentPlayers.data.sort((a, b) => a.elo - b.elo));
      setMatchHistory(currentHist.data.sort((a, b) => b.unixTS - a.unixTS));
    } else {
      console.log("issue getting data for dashboard");
    }
  };

  useEffect(() => {
    getAndSetAllData();
  }, []);

  const handleShowDialog = (text: string) => {
    setDialogText(text);
    setDoShowDialog(true);
    setTimeout(() => {
      setDoShowDialog(false);
    }, 3000);
  };
  const handleSubmitMatchHistUpdate = () => {
    if (
      (matchesUserWon === 0 && matchesUserLost === 0) ||
      matchesUserWon < 0 ||
      matchesUserLost < 0 ||
      !user ||
      !opponent
    ) {
      handleShowDialog(
        "Check either wins or losses is greater than 0 and you have selected either yourself or an opponent"
      );
      return;
    }
    updateMatchHist([
      ...Array.from({ length: matchesUserWon }, () => ({
        playerOneName: user,
        playerTwoName: opponent,
        playerOneDidWin: true,
        unixTS: Date.now(),
        reportedBy: user,
      })),
      ...Array.from({ length: matchesUserLost }, () => ({
        playerOneName: user,
        playerTwoName: opponent,
        playerOneDidWin: false,
        unixTS: Date.now(),
        reportedBy: user,
      })),
    ]);
    setMatchesUserLost(0);
    setMatchesUserWon(0);
    setOpponent("");
  };

  //to do: initialise docs in firebase
  //create a handler for submit match update, create multiple matchhistrows
  //depending on numbers passed, also have a check for cantt be 0 or empty for any
  //and then update
  //handle add new player, and text to refresh
  //display fetched data in tables.

  return (
    <div className="App">
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Layout>
          <>
            {eloRankings && matchHistory ? (
              <>
                <Text c="blue" fz="sm" fw={700} ta="center">
                  Update your match history
                </Text>

                <Autocomplete
                  placeholder="You"
                  value={user}
                  onChange={(str) => handleUserChange(str)}
                  data={eloRankings.map((row) => row.name)}
                />
                <Text>played</Text>
                <Autocomplete
                  placeholder="Opponent"
                  value={opponent}
                  onChange={(str) => setOpponent(str)}
                  data={eloRankings.map((row) => row.name)}
                />
                <Text>and won:</Text>

                <NumberInput
                  value={matchesUserWon}
                  onChange={(num) => setMatchesUserWon(num === "" ? 0 : num)}
                />
                <Text>and lost:</Text>
                <NumberInput
                  value={matchesUserLost}
                  onChange={(num) => setMatchesUserLost(num === "" ? 0 : num)}
                />
                <Text>matches</Text>

                <Button color="pink" onClick={handleSubmitMatchHistUpdate}>
                  Submit
                </Button>
                {doShowDialog && (
                  <DialogPopover>
                    <Text c="red">{dialogText}</Text>
                  </DialogPopover>
                )}
                <br></br>
                <br></br>

                <br></br>

                <br></br>

                <Text c="blue" fz="sm" fw={700} ta="center">
                  Player rankings
                </Text>

                <EloTable data={eloRankings}></EloTable>
                <Text c="blue" fz="sm" fw={700} ta="center">
                  Match history
                </Text>

                <MatchHistTable data={matchHistory}></MatchHistTable>
                <Text c="blue" fz="sm" fw={700} ta="center">
                  Add a new player
                </Text>

                <TextInput
                  placeholder="Name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                ></TextInput>

                <Button
                  onClick={() => {
                    if (
                      newPlayerName.length === 0 ||
                      eloRankings
                        .map((player) => player.name)
                        .includes(newPlayerName)
                    ) {
                      return;
                    }
                    addNewPlayer(newPlayerName);
                    setNewPlayerName("");
                  }}
                >
                  Add player
                </Button>
              </>
            ) : (
              <>
                <Text>Loading...</Text>
              </>
            )}
          </>
        </Layout>
      </MantineProvider>
    </div>
  );
}

export default App;
