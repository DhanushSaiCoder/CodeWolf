import array

def is_even(num):
    return "Even" if num % 2 == 0 else "Odd"

test_cases = [
    {
        "input": [2],
        "expected_output": "Even"
    },
    {
        "input": [3],
        "expected_output": "Odd"
    }
]

results = []

def test_func():
    index = 1;
    for tc in test_cases: 
        inp = tc["input"][0] if len(tc["input"]) == 1 else tc["input"]
        expected = tc["expected_output"]

        output = is_even(inp)

        results.append({
           "test_case_number": index,
           "result": "PASS" if str(expected) == str(output) else "FAIL",
           "output": output
        })

        index += 1

test_func()
print(results)
