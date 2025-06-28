import React from 'react'
import { useEffect, useState } from 'react'
import "../styles/QuestionDetails.css"

const sampleQuestion = {
  questionTitle: "Two Sum",
  description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.<br/><br/> You may assume that each input would have <b>exactly one solution</b>, and you may not use the same element twice. You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: [0, 1]
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: [1, 2]
    }
  ]
}

export default function QuestionDetails(props) {
  let { matchDoc } = props;

  //states
  const [question, setQuestion] = useState(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);

  console.log("matchDoc in QuestionDetails: ", JSON.parse(matchDoc));
  matchDoc = JSON.parse(matchDoc);
  // useEffect to fetch the question details using filters from matchDoc.
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/questions?mode_slug=${matchDoc.mode}&question_difficulty=${matchDoc.difficulty}&programming_language=${matchDoc.language == "js" ? "javascript" : matchDoc.language}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error(`Error fetching question: ${response.statusText}`);
        }
        const data = await response.json();
        setQuestion(data.data[0]); // Assuming the first question is the one we want
        setIsFetchingQuestion(false);
        console.log("Fetched question details: ", data.data[0]);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    if (matchDoc) fetchQuestionDetails();

  }, [matchDoc]);

  return (
    <div className='QuestionDetails'>
      <div className='QuestionDetailsHeader'>
        <h3>Question</h3>
      </div>
      {!isFetchingQuestion && (<div className='QuestionDetailsBody'>
        <h3 className='questionTitle'>{question.question_title}</h3>
        {/* <p className='questionMode'>Mode: {question.question_mode}</p> */}
        {/* <p className='questionDifficulty'>Difficulty: {question.question_difficulty}</p> */}
        
        {
          question.question_description.map((line, index) => (
            <>
              <br key={`br-${index}`} />

              <p key={index}
                className='descriptionTxt'
                dangerouslySetInnerHTML={{ __html: line }}
              ></p>
            </>
          )
          )
        }


        <div className='examples'>

          <h3>Examples</h3>
          {question.examples.map((example, index) => (
            <div className='exampleSet' key={index}>
              <p>
                <strong>Input:</strong> {example.input}
              </p>
              <p>
                <strong>Output:</strong> {example.output}
              </p>
            </div>
          ))}
        </div>

      </div>)}
      {isFetchingQuestion && (
        <div className='loading'>
          <p>Loading question details...</p>
        </div>
      )}
    </div>
  )
}
