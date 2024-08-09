import React, { useState, useEffect, useContext } from 'react'
import Keyboard, { KeyboardContext } from './Keyboard';
import styles from './Keyboard.module.css'

const Timer = ({ onTimerEnd }) => {
  const {time, setTime, timeDuration, start, userTyped, gameOver} = useContext(KeyboardContext)
  // True when the user types a character, starting the game and timer
  const [userStart, toggleUserStart] = useState(userTyped.length > 0);

  useEffect(() => {
    if (userTyped.length > 0 && !userStart) toggleUserStart(true);
    else if (userTyped.length === 0 && userStart) toggleUserStart(false);
  }, [userTyped])

  useEffect(() => {
    // Timer only runs when game starts
    if (userStart) {
      // Decrement the time each second using setTimeout
      if (time > 0) {
        const timerTimeOut = setTimeout(() => {
          setTime(t => t -= 1);
        }, 1000)
        // Cleanup function
        return () => clearTimeout(timerTimeOut);
      } else {
        onTimerEnd();
      }
    } else {
      // Reset the time back to its original duration if the game ends via time or when the user finishes
      if (time !== timeDuration) {
        setTime(timeDuration); 
        toggleUserStart(false);
      }
    }
  }, [time, userStart])

  return (
    <div className={styles.timer} style={{visibility: start ? 'visible' : 'hidden'}}>{time}</div>
  )
}

export default Timer