#include <stdio.h>

int main() {
    int num1, num2;
    
    printf("Enter first number: ");
    scanf("%d", &num1);
    
    printf("Enter second number: ");
    scanf("%d", &num2);
    
    if (num1 > num2) {
        printf("%d is greater than %d\n", num1, num2);
    } else if (num2 > num1) {
        printf("%d is greater than %d\n", num2, num1);
    } else {
        printf("Both numbers are equal: %d = %d\n", num1, num2);
    }
    
    printf("Press any key to continue...");
    getchar(); // consume the newline from scanf
    getchar(); // wait for user input
    
    return 0;
}
