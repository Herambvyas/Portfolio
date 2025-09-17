#include <stdio.h>

int main() 
{
    int x, y, z;
    
    printf("Enter three numbers: ");
    scanf("%d %d %d", &x, &y, &z);
    
    if(x > y)
    {
        if(x > z)
            printf("%d is the greatest number\n", x);
        else
            printf("%d is the greatest number\n", z);
    }
    else
    {
        if(y > z)
            printf("%d is the greatest number\n", y);
        else
            printf("%d is the greatest number\n", z);
    }
    
    return 0;
}
