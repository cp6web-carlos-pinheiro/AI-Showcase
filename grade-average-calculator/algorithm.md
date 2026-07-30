FUNCTION calculateAverage(grades):
    IF grades is empty:
        RETURN 0
    total = 0
    FOR each grade IN grades:
        total = total + grade
    average = total / LENGTH(grades)
    RETURN average

FUNCTION classifyAverage(avg):
    IF avg >= 0 AND avg <= 4:
        RETURN "Bad"
    ELSE IF avg >= 5 AND avg <= 7:
        RETURN "Good"
    ELSE IF avg >= 8 AND avg <= 10:
        RETURN "Great"
    ELSE:
        RETURN "Invalid average"   // just in case

MAIN:
    grades = [2, 5, 8, 9, 7, 6, 9, 8, 4, 6]
    avg = calculateAverage(grades)
    classification = classifyAverage(avg)
    PRINT "The average is: " + avg
    PRINT "Classification: " + classification
END