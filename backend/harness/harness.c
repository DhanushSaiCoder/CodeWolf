#include <stdio.h>
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
