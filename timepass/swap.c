#include <stdio.h>

int main() {
    int x;
    
    printf("Enter value of x: ");
    scanf("%d", &x);
    
    if (x > 0) {
        printf("X is positive");
    } else {
        printf("X is negative or zero");
    }
    
    printf("\nPress any key to continue...");
    getchar(); // consume the newline from scanf
    getchar(); // wait for user input
    
    return 0;
}
