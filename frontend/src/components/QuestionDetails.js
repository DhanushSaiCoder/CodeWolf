import React from 'react'
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

export default function QuestionDetails() {
  return (
    <div className='QuestionDetails'>
      <div className='QuestionDetailsHeader'>
        <h3>Question</h3>
      </div>
      <div className='QuestionDetailsBody'>
        <h3 className='questionTitle'>{sampleQuestion.questionTitle}</h3>
        <p
          className='descriptionTxt'
          dangerouslySetInnerHTML={{ __html: sampleQuestion.description }}
        ></p>

        <div className='examples'>

          <h3>Examples</h3>
          {sampleQuestion.examples.map((example, index) => (
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

      </div>
    </div>
  )
}
