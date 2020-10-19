import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';
import './App.css';

const numRows = 42;
const numCols = 85;
let generations = 0;

const operations = [
  [0,1],
  [0,-1],
  [1,-1],
  [-1,1],
  [1,1],
  [-1,-1],
  [1,0],
  [-1,0]
]

function generateEmptyGrid() {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0))
  }
  return rows
}

function App() {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [running, setRunning] = useState(false);

  //using a changing state in a callback, one way of doing it.
  //use 'useRef'
  const runningRef = useRef(running);
  runningRef.current = running;

  //We don't want this function to be created every render so we use 'useCallback()'
  const runSimulation = useCallback(() => {
    if(!runningRef.current) {
      return;
    }
    generations += 1
    console.log(generations);
    // Simulates everything
    setGrid((g) => {
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            //For a given cell, how many neighbors do we have?
              let neighbors = 0;
              operations.forEach(([x,y]) => {
                const newI = i + x;
                const newK = k + y;
                if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                  neighbors += g[newI][newK]
                }
              })

              //Once we have number neighbors, we can apply game conditions
              if (neighbors < 2 || neighbors > 3) {
                gridCopy[i][k] = 0;
              } else if (g[i][k] === 0 && neighbors === 3) {
                gridCopy[i][k] = 1;
              }
          }
        }
      });
    });
    setTimeout(runSimulation, 500);
  }, [])

  return (
    <>
      <button onClick={()=> {
        setRunning(!running); 
        if(!running) {
          runningRef.current = true;
          runSimulation()
        }
        }}>
        {running ? 'Stop' : 'Start'}
      </button>
      <button onClick={() => setGrid(generateEmptyGrid())}>Clear</button>
      <button onClick={() => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
          rows.push(Array.from(Array(numCols), () => Math.random() > .75 ? 1 : 0))
        }
        setGrid(rows);
      }}>Randomize</button>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 20px)`
      }}>
        {grid.map((rows, i) => 
          rows.map((col, k) => ( 
        <div 
          key={`${i}-${k}`}
          onClick={()=> {
            const newGrid = produce(grid, gridCopy => {
              gridCopy[i][k] = grid[i][k] ? 0 : 1;
            });
            setGrid(newGrid)
          }}
          style={{
            width: 20,
            height: 20,
            backgroundColor: grid[i][k] ? 'red' : undefined,
            border: "solid 1px black" 
          }}></div> )))}
      </div>
    </>
  );
}

export default App;
