#include <stdio.h>
#include <string.h>
// extra headers comes here
#include <stdbool.h>

// result struct
typedef struct
{
    int test_case_number;
    char result[10]; // "PASS" or "FAIL"
    bool output;
} TestResult;

// user function comes here
bool isEven(int num)
{
    if (num % 2 == 0)
        return true;
    return false;
}

// example_test_cases:
// [
//     {input: [2], expected_output: true},
//     {input: [2], expected_output: true},
//     {input: [2], expected_output: true},
//     {input: [2], expected_output: true}
// ]

// main function
int main()
{
    // we run the tests with testcases here
    TestResult results[100];
    int test_cases_length = 4;
    char function_name[] = "isEven";
    const bool expected_output = false; // data type of function_return_type

    int inputs[] = {2, 3, 10, 11};
    const bool expected_outputs[] = {true, false, true, false};

    for (int i = 0; i < test_cases_length; i++)
    {
        results[i].test_case_number = i + 1;
        bool output = isEven(inputs[i]);
        results[i].output = output;
        strcpy(results[i].result, output == expected_outputs[i] ? "PASS" : "FAIL");
    }
    
    return 0;
}

// submitResults:
// {
//   "success": true,
//     "results": [
//       {
//         "test_case_number": 1,
//         "result": "PASS",
//         "output": true
//       }
//     ],
//       "all_PASS": true

// example test code:
