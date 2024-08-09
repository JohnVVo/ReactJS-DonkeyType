import React, { useEffect, useState, createContext } from 'react'
import styles from './Keyboard.module.css'
import wordFile from '../words.json'
import Timer from './Timer'
// Icons
import { FaAngleLeft, FaAngleUp, FaRedoAlt, FaRandom, FaStepBackward } from 'react-icons/fa'

export const KeyboardContext = createContext();  

const Keyboard = () => {
  const [words, setWords] = useState([]);
  const [wordPassage, setWordPassage] = useState('');
  const [characters, setCharacters] = useState([]);
  const [start, toggleStart] = useState(false);
  const [userTyped, setUserTyped] = useState([]); // Holds subarrays of [character typed, if that character matches]
  const [timeDuration, setTimeDuration] = useState(15); // Default to 15 seconds, changes depending on user timer selection (NOT IMPLEMENTED)
  const [time, setTime] = useState(timeDuration);
  const [stats, setStats] = useState({ numCorrect: 0, wpm: 0 });
  const [gameOver, toggleGameOver] = useState(false);

  const fetchWords = () => {
    const randomWords = wordFile
      .sort(() => Math.random() - Math.random())
      .filter(w => w.length <= 5)
      .slice(0, 100);
    
      const list = [];
      let passage = '';
      randomWords.forEach((word, index) => {
        for (let i = 0; i < word.length; i++) {
          list.push(word[i]);
          passage += word[i];
          // Add a space separator for each word unless it is the very last word
          if (i === (word.length - 1) && index != (words.length - 1)) {
          list.push(' ');
          passage += ' ';
        }
      }
    })

    setWords(randomWords);
    setCharacters(list);
    setWordPassage(passage);
  }

  useEffect(() => {
    // Converts the user's input to a character string
    const handleTyping = (e) => {
      const char = String.fromCharCode(e.keyCode).toLowerCase();
      if (start) {
        // Ignore non-alpha characters
        const regex = /^[A-Z0-9\s\b]$/i;
        if (!char.match(regex)) return;
        else if (e.ctrlKey && char === "\b") { // Ctrl + Backspace
          let deleteAmount = 0;
          let deleteAmountCorrect = 0;
          for (let i = userTyped.length - 1; i >= 0; i--) {
            console.log(userTyped[i][0]);
            console.log(deleteAmount);
            if (characters[i][0] === ' ' && i != userTyped.length - 1) {
              setStats(prev => ({...prev, numCorrect: prev.numCorrect - deleteAmountCorrect}))
              setUserTyped(prev => [...prev].splice(0, prev.length - deleteAmount));
              return;
            } else if (i === 0) {
              setStats(prev => ({...prev, numCorrect: 0}))
              setUserTyped(prev => [...prev].splice(0, prev.length - deleteAmount - 1));
              return;
            }
            deleteAmount += 1;
            if (userTyped.length != 0 && userTyped[i][1]) deleteAmountCorrect += 1;
          }
          return;
        }
        else if (char == "\b") {
          // Delete last character and decrement number correct if the character matched
          if (userTyped.length != 0 && userTyped.at(-1)[1]) setStats(prev => ({...prev, numCorrect: prev.numCorrect - 1}))
          setUserTyped(prev => [...prev].splice(0, prev.length - 1));
          return;
        }
        // Append the character to the stateful variable array
        setUserTyped(prev => [...prev, [char, checkCharMatch(char, userTyped.length)]]);
      // Available keys before the game starts
      } else {
        if (char === "\r") {
          toggleStart(true); 
          handleReset();
        }
        else if (char === "1") handleTimeSelect(15);
        else if (char === "3") handleTimeSelect(30);
        else if (char === "6") handleTimeSelect(60);
      }
    }
    // Check if the target character matches the user's input
    const checkCharMatch = (inputChar, index) => {
      const targetChar = characters[index];
      console.log(index, inputChar, targetChar)
      if (inputChar == targetChar) {
        console.log("True");
        setStats(prev => ({
          ...prev, numCorrect: prev.numCorrect + 1
        }));
        return true;
      } else {
        return false;
      }
    }

    // Game ends when the user types more than the amount of characters available
    console.log(`${userTyped.length} > ${characters.length}`)
    if (userTyped.length == characters.length && userTyped.length != 0) {
      handleGameOver();
      return;
    }
    document.addEventListener('keydown', handleTyping);

    return () => {
      document.removeEventListener('keydown', handleTyping);
    }
  }, [userTyped, characters]);

  const handleTimeSelect = (selectedTime) => {
    setTimeDuration(selectedTime);
    setTime(selectedTime);
  }

  const getStats = () => {
    // (# characters correct / 5) words / (elapsed time) minutes
    const calculateWPM = Math.round((userTyped.length / 5) / ((timeDuration - time) / 60));
    console.log("Stats:\n\tAmount correct: ", stats.numCorrect, "\n\tWPM", calculateWPM);
    // Update stats state
    setStats(prev => ({
      ...prev, wpm: calculateWPM
    }));
  }

  const handleGameOver = () => {
    toggleStart(false);
    toggleGameOver(true);
    console.log("Game over!");
    getStats();
  }
  
  const handleReset = () => {
    setUserTyped([]);
    setStats({ numCorrect: 0, wpm: 0 });
    toggleGameOver(false);
    setTime(15);
    fetchWords();
  }

  const handleTimeEnd = () => {
    console.log("The timer ended");
    handleGameOver();
  }

  const handleShuffle = (e) => {
    resetProgress();
    fetchWords();
    e.currentTarget.blur();
  }

  const handleReturn = (e) => {
    resetProgress();
    toggleStart(false);
  }

  const resetProgress = (e) => {
    // e.target.blur();
    setStats({ numCorrect: 0, wpm: 0 });
    setUserTyped([]);
    if (e) e.currentTarget.blur();
  }

  const renderCharacters = () => {
    let charIndex = 0;
    return words.map((word, i) => {
      return (
        <div className={styles.wordsetWord} id={`word-${i}`} key={`word-${i}`}>
          {[...word].map((character, index) => {
            let char = null;
            if (i != words.length - 1 && index == word.length - 1) {
              char = ([
                <p 
                  className={`${userTyped[charIndex] ? "" : "opacity"} 
                              ${userTyped[charIndex] && !userTyped[charIndex][1] ? "incorrect" : ""}
                              ${charIndex == userTyped.length ? "cursor" : ""}`}
                  // style={{opacity: userTyped[charIndex] ? "100%" : "50%", color: userTyped[index] && !userTyped[index][1] ? "red" : ""}}
                  index={`character-${charIndex}`} 
                  key={charIndex}>
                    {character}
                </p>,
                <p 
                  className={`${userTyped[charIndex + 1] ? "" : "opacity"} 
                              ${userTyped[charIndex + 1] && !userTyped[charIndex + 1][1] ? "incorrect-highlight" : ""}
                              ${charIndex + 1 == userTyped.length ? "cursor" : ""}`}
                  // style={{opacity: userTyped[charIndex] ? "100%" : "50%", color: userTyped[index] && !userTyped[index][1] ? "red" : ""}}
                  index={`character-${charIndex + 1}`} 
                  key={charIndex + 1}>
                    {'\u00A0\u00A0'}
                </p>
              ])
              charIndex += 2
            } else {
              char = (
                <p 
                  className={`${userTyped[charIndex] ? "" : "opacity"} 
                              ${userTyped[charIndex] && !userTyped[charIndex][1] ? "incorrect" : ""}
                              ${charIndex == userTyped.length ? "cursor" : ""}`}
                  // style={{opacity: userTyped[charIndex] ? "100%" : "50%", color: userTyped[index] && !userTyped[index][1] ? "red" : ""}}
                  index={`character-${charIndex}`} 
                  key={charIndex}>
                    {character}
                </p>
              )
              charIndex += 1;
            }

            return char;
          })}
        </div>
      )
    })
  }

  // console.log(words);
  // console.log(wordPassage);
  // console.log(characters);
  // console.log(userTyped);
  // console.log(stats)

  return (
    <div style={styles} className={styles.container}>
      <KeyboardContext.Provider value={{time, setTime, timeDuration, start, userTyped, gameOver}}>
        <Timer onTimerEnd={handleTimeEnd} />
      </KeyboardContext.Provider>
      <h1 className={styles.title}>DonkeyType</h1>
      {/* The div will contain the collection of words and will accept keyboard input on focus */}
      <div className={styles.wordsetContainer}>
        <div className={styles.wordset}>
          { start ?
          (
            renderCharacters()
          ) :
          ( <div className={styles.selectDuration}>
              <button 
                className={styles.startBtn}
                onClick={() => {toggleStart(true); handleReset()}}
              >
                <FaAngleLeft /> Start
              </button>
              <button 
                className={`${styles.timeSelector} ${styles.timeSelector15}`}
                onClick={() => {handleTimeSelect(15)}}
              >
                15s
              </button>
              <button 
                className={`${styles.timeSelector} ${styles.timeSelector30}`}
                onClick={() => {handleTimeSelect(30)}}
              >
                30s
              </button>
              <button 
                className={`${styles.timeSelector} ${styles.timeSelector60}`}
                onClick={() => {handleTimeSelect(60)}}
              >
                60s
              </button>
              <div className={styles.pointer} style={{left: timeDuration == 15 ? "5%" : timeDuration == 30 ? "17%" : "35%"}}><FaAngleUp /></div>
              <div className={styles.spacebar} style={{display: start ? "none" : "block"}}></div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.gameBtns} style={{visibility: start  && !gameOver ? "visible" : "hidden"}}>
        <button className={styles.backBtn} onClick={(e) => handleReturn(e)}><FaStepBackward /></button>
        <button className={styles.shuffleBtn} onClick={(e) => handleShuffle(e)}><FaRandom /></button>
        <button className={styles.refreshBtn} onClick={(e) => resetProgress(e)}><FaRedoAlt /></button>
      </div>
      <div className={styles.statsBar} id='stats-bar' style={{visibility: gameOver ? 'visible' : 'hidden'}}>
        <div className={styles.stats}>
          <p>Accuracy: {stats.numCorrect}/{userTyped.length}/{characters.length}</p>
          <p>WPM: {stats.wpm}</p>
        </div>
        <div className={styles.statsToolTip}>
          <p>
            Correct characters / Characters typed / Total characters in the set
          </p>
        </div>
      </div>
    </div>
  )
}

export default Keyboard