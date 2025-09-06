#include <stdio.h>

int main() {
    int number;
    
    printf("Enter a number: ");
    scanf("%d", &number);
    
    if (number % 2 == 0) {
        printf("%d is an even number\n", number);
    } else {
        printf("%d is an odd number\n", number);
    }
    
    printf("Press any key to continue...");
    getchar(); // consume the newline from scanf
    getchar(); // wait for user input
    
    return 0;
}
