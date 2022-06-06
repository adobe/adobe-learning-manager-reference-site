/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityPoll.module.css";

const PrimeCommunityPoll = (props: any) => {
  const { formatMessage } = useIntl();
  const post = props.post;
  const pollOptions = JSON.parse(post.otherData);
  const myPoll = post.myPoll;
  const [choiceSelectedIndex, setChoiceSelectedIndex] = useState("");
  const [choiceSelected, setChoiceSelected] = useState("");
  const [alreadyVoted, setAlreadyVoted] = useState(myPoll ? false : true);
  const [pollStats, setPollStats] = useState([]);
  const [totalVotes, setTotalVotes] = useState(-1);

  const selectPollOption = (value: any, index: any) => {
    setChoiceSelected(value);
    setChoiceSelectedIndex(index);
  };

  const submitPoll = () => {
    if (typeof props.submitPoll === "function") {
      props.submitPoll(choiceSelectedIndex);
      updatePostStats();
      postSubmitActions();
    }
  };

  const updatePostStats = () => {
    let currentPollStats = [] as any;
    if (pollStats.length > 0) {
      currentPollStats = pollStats;
      currentPollStats[parseInt(choiceSelectedIndex) - 1] = isNaN(
        currentPollStats[parseInt(choiceSelectedIndex) - 1]
      )
        ? 1
        : parseInt(currentPollStats[parseInt(choiceSelectedIndex) - 1]) + 1;
      setTotalVotes(totalVotes + 1);
    } else {
      currentPollStats[parseInt(choiceSelectedIndex) - 1] = 1;
      setTotalVotes(1);
    }
    setPollStats(currentPollStats);
  };

  const postSubmitActions = (id?: any) => {
    if (id) {
      let selectedOptionValue =
        document
          .getElementById(props.post.id + "-input-" + id)
          ?.getAttribute("value") || "";
      selectPollOption(selectedOptionValue, id);
    }
    setAlreadyVoted(true);
  };

  const pollSubmitCss = () => {
    for (let i = 0; i < pollStats.length; i++) {
      let selectedElement = document.getElementById(
        props.post.id + "-fill-" + i
      ) as HTMLElement;
      if (selectedElement && pollStats[i]) {
        selectedElement.style.borderBottom = "solid #306EB5 4px";
        selectedElement.style.width =
          getVotePercent(parseInt(pollStats[i])) + "%";
      }
    }
  };

  useEffect(() => {
    //if user has voted
    if (myPoll.optionId) {
      postSubmitActions(myPoll.optionId);
    }

    if (props.post.pollStats) {
      let pollStats = JSON.parse(props.post.pollStats);
      if (pollStats) {
        let currentPollStats = [] as any;
        let voteCount = 0;
        for (let x in pollStats) {
          currentPollStats[parseInt(x) - 1] = pollStats[x];
          voteCount += parseInt(pollStats[x]);
        }
        setPollStats(currentPollStats);
        setTotalVotes(voteCount);
      }
    }
  }, [props.post]);

  useEffect(() => {
    if (alreadyVoted) {
      pollSubmitCss();
    }
  }, [alreadyVoted]);

  const getVotePercent = (value: any) => {
    let percentValue = ((value * 100) / totalVotes) as any;
    let valueUptoTwoDecimalPlaces = percentValue
      ?.toString()
      .match(/^-?\d+(?:\.\d{0,2})?/)[0];
    return valueUptoTwoDecimalPlaces.endsWith(".00")
      ? valueUptoTwoDecimalPlaces.substring(
          0,
          valueUptoTwoDecimalPlaces.length - 3
        )
      : valueUptoTwoDecimalPlaces;
  };

  return (
    <>
      {pollOptions.map((item: any, index: any) => (
        <div
          className={styles.primeCommunityPollContainer}
          key={props.post.id + "-" + index}
        >
          <div className={styles.primeCommunityPollButtonContainer}>
            <input
              id={props.post.id + "-input-" + (index + 1)}
              name="pollOption"
              disabled={alreadyVoted}
              className={styles.primeCommunityPollButton}
              value={item.text}
              type="radio"
              onClick={() => {
                selectPollOption(item.text, index + 1);
              }}
            ></input>
          </div>
          <div className={styles.primeCommunityPollOptionContainer}>
            <div className={styles.primeCommunityPollOption}>{item.text}</div>
            {alreadyVoted && <div id={props.post.id + "-fill-" + index}></div>}
          </div>
          {pollStats[index] && alreadyVoted && (
            <div className={styles.primeCommunityPollStats}>
              {getVotePercent(parseInt(pollStats[index]))}% ({pollStats[index]}{" "}
              {formatMessage({
                id: "alm.community.post.poll.voteLabel",
                defaultMessage: "vote",
              })}
              )
            </div>
          )}
        </div>
      ))}
      {choiceSelected !== "" && !alreadyVoted && (
        <div className={styles.primeCommunitySubmitPollContainer}>
          <button
            className={styles.primeCommunitySubmitPollButton}
            onClick={submitPoll}
          >
            {formatMessage({
              id: "alm.community.post.poll.submitChoice",
              defaultMessage: "Submit Choice",
            })}
          </button>
          <hr />
        </div>
      )}
      {choiceSelected !== "" && alreadyVoted && (
        <div>
          <div className={styles.primeCommunityAlreadySubmittedPoll}>
            {formatMessage({
              id: "alm.community.post.poll.submittedChoice",
              defaultMessage: "You have submitted your choice",
            })}
          </div>
          <hr />
        </div>
      )}
    </>
  );
};
export default PrimeCommunityPoll;
