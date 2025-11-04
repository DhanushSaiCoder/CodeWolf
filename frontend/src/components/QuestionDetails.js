import React, { useEffect, useState, useMemo } from 'react';
import "../styles/QuestionDetails.css";
import LightbulbIcon from '@mui/icons-material/Lightbulb';
/**
 * QuestionDetails component fetches and displays details of a specific question
 * based on the match document passed as a prop.
 *
 * @param {Object} props - Component props.
 * @param {string} props.matchDocStr - JSON string representing the match document.
 * @returns {JSX.Element} Rendered component.
 */


export default function QuestionDetails({ matchDoc, handleQuestionFound, isMobile }) {
  // states
  const [question, setQuestion] = useState(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);


  useEffect(() => {
    if (!matchDoc) return;
    const fetchQuestionDetails = async () => {
      try {
        // if matchDoc has questionId, get it from database
        if (matchDoc.questionId) {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/questions/${matchDoc.questionId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          if (!response.ok) {
            throw new Error(`Error fetching question: ${response.statusText}`);
          }
          const data = await response.json();
          setQuestion(data.data);
          handleQuestionFound(data.data)
          setIsFetchingQuestion(false);
          return;
        }
        // If matchDoc.questionId is not present, do nothing. MatchWait component is responsible for setting the questionId.
        // This component will remain in a loading state until matchDoc is updated with a questionId.
        setIsFetchingQuestion(false); // Ensure loading state is cleared if no questionId and no fetch
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (matchDoc) fetchQuestionDetails();

  }, [matchDoc]); // depend on the parsed object


  // Function to update questionId in the match document in the database
  const updateQuestionIdInDatabase = async (questionId) => {
    if (!questionId) return; // No questionId to update
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/matches/${matchDoc._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ questionId, ...matchDoc }) // Assuming you want to set status to 'in-progress'
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating match: ${response.statusText}`);
      }

      const data = await response.json();
    } catch (err) {
      console.error("Update error:", err);
    }
  }

  const renderDisplayValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  };

  return (
    <div className='QuestionDetails'>
      {!isMobile && (<div className='QuestionDetailsHeader'>
        <h3>Question</h3>


      </div>)
      }
      {!isFetchingQuestion && question && (
        <div className='QuestionDetailsBody'>

          <h3 className='questionTitle'>{question.question_title}</h3>



          {question.question_description.map((line, index) => (
            <React.Fragment key={index}>
              <br />
              <p
                className='descriptionTxt'
                dangerouslySetInnerHTML={{ __html: line }}
              ></p>
            </React.Fragment>
          ))}

          <div className='examples'>
            <h3>Examples</h3>
            {question.examples.map((example, index) => (
              <div className='exampleSet' key={index}>
                <p>
                  <strong>Input:</strong> {renderDisplayValue(example.input)}
                </p>
                <p>
                  <strong>Output:</strong> {renderDisplayValue(example.output)}
                </p>
              </div>
            ))}
          </div>




          <div className='testcasesDiv'>
            <h3>Test Cases</h3>
            <div className='testcasesSet'>
              {question.test_cases && question.test_cases.length > 0 ? (
                question.test_cases.map((testCase, index) => (
                  <div key={index} className='testcase'>
                    <p>
                      <strong>Input:</strong> {renderDisplayValue(testCase.input)}
                    </p>
                    <p>
                      <strong>Output:</strong> {renderDisplayValue(testCase.expected_output)}
                    </p>
                  </div>
                ))
              ) : (
                <p>No test cases available for this question.</p>
              )}
            </div>
          </div>


          <div className='hintsDiv'>
            <h3>Hints</h3>
            <div className='hintsSet'>
              {question.hints && question.hints.length > 0 ? (
                question.hints.map((hint, index) => (
                  <p key={index} className='hint'>
                    <LightbulbIcon
                      sx={
                        { fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }
                      }
                    /> {hint}
                  </p>
                ))
              ) : (
                <p>No hints available for this question.</p>
              )}
            </div>
          </div>
          <div className='tagsDiv'>
            <h3>Tags</h3>
            <div className='tags'>
              {question.tags.map((tag, index) => (
                <span key={index} className='tag'>
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>

      )}
      {isFetchingQuestion && (
        <div className='loading'>
          <p>Loading question details...</p>
        </div>
      )}

    </div>
  );
}
