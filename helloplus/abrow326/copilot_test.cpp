#include <iostream>
#include <vector>
using namespace std;

// Write a function that returns the fibonacci sequence up to n
#include <vector>

vector<unsigned int> fibonacci(int n) {
    vector<unsigned int> seq;
    if (n <= 0) return seq;
    seq.push_back(0);
    if (n == 1) return seq;
    seq.push_back(1);
    for (int i = 2; i < n; ++i) {
        seq.push_back(seq[i - 1] + seq[i - 2]);
    }
    return seq;
}

int main (int argc, char* argv[]) {

    vector<unsigned int> fib = fibonacci(100);
    for (size_t i = 0; i < fib.size(); ++i) {
        cout << fib[i] << " ";
    }

    return 0;
}