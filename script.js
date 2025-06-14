document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary DOM elements ---

    // Overall Tracker Elements
    const allCheckboxes = document.querySelectorAll('.task-list input[type="checkbox"]');
    const overallProgressBarFill = document.getElementById('overallProgressBarFill');
    const overallProgressPercentage = document.getElementById('overallProgressPercentage');

    // Main Course Tracker Elements
    const mainCourseCheckboxes = document.querySelectorAll('#mainCourseList input[type="checkbox"]');
    const mainCourseProgressBarFill = document.getElementById('mainCourseProgressBarFill');
    const mainCourseProgressPercentage = document.getElementById('mainCourseProgressPercentage');

    // Theory Exams Tracker Elements
    const theoryExamsCheckboxes = document.querySelectorAll('#theoryExamsList input[type="checkbox"]');
    const theoryProgressBarFill = document.getElementById('theoryProgressBarFill');
    const theoryProgressPercentage = document.getElementById('theoryProgressPercentage');

    // Flying Hours Tracker Elements
    const flyingHoursInput = document.getElementById('flyingHoursInput');
    const updateHoursBtn = document.getElementById('updateHoursBtn');
    const hoursProgressBarFill = document.getElementById('hoursProgressBarFill');
    const hoursProgressPercentage = document.getElementById('hoursProgressPercentage');
    const hoursRemainingText = document.getElementById('hoursRemaining');
    const totalHoursRequired = 250; // Define the target hours

    // --- Helper Function to Update Any Progress Bar ---
    // This function takes:
    // - `checkboxesToCount`: A NodeList of checkboxes relevant to this bar
    // - `progressBarFillElement`: The div that represents the progress bar fill
    // - `progressPercentageElement`: The span that displays the percentage text
    // - `isOverall`: A boolean to indicate if it's the overall bar (for total tasks calculation)
    // - `currentHours` (optional): For the hours tracker, the current value
    // - `totalHours` (optional): For the hours tracker, the maximum target
    function updateProgressBar(checkboxesToCount, progressBarFillElement, progressPercentageElement, type = 'checkbox', currentVal = 0, totalVal = 1) {
        let percentage = 0;
        let displayValue = "";

        if (type === 'checkbox') {
            const completedTasks = Array.from(checkboxesToCount).filter(cb => cb.checked).length;
            const totalTasks = checkboxesToCount.length;
            percentage = (totalTasks > 0) ? (completedTasks / totalTasks) * 100 : 0;
            displayValue = `${Math.round(percentage)}%`;
        } else if (type === 'hours') {
            percentage = (totalVal > 0) ? (currentVal / totalVal) * 100 : 0;
            displayValue = `${currentVal} Hours`;
            // Update remaining hours text for the flying hours tracker
            if (hoursRemainingText) {
                const remaining = totalVal - currentVal;
                hoursRemainingText.textContent = `${Math.max(0, remaining)} Hours Remaining`;
                if (currentVal >= totalVal) {
                    hoursRemainingText.textContent = "250 Hours Achieved! 🎉";
                    hoursRemainingText.style.color = '#4CAF50'; // Green when complete
                } else {
                     hoursRemainingText.style.color = '#007bff'; // Back to blue otherwise
                }
            }
        }

        progressBarFillElement.style.width = `${percentage}%`;
        progressPercentageElement.textContent = displayValue;

        // Optional: Change color based on progress (customize for each bar if needed)
        // This makes the progress bar transition from red to yellow to green
        if (percentage < 30) {
            progressBarFillElement.style.background = 'linear-gradient(to right, #B30000, #FF6666)'; // Deep Red to Muted Red
        } else if (percentage < 70) {
            progressBarFillElement.style.background = 'linear-gradient(to right, #FFCC00, #FFEA80)'; // Rich Gold to Soft Yellow
        } else {
            progressBarFillElement.style.background = 'linear-gradient(to right, #3CB371, #66CDAA)'; // Medium Sea Green to Aqua Green
        }
    }

    // --- Logic for Checkbox Trackers (Main Course & Theory Exams) ---

    // Function to load and apply checkbox states from localStorage
    function loadCheckboxProgress(checkboxes) {
        checkboxes.forEach(checkbox => {
            const taskId = checkbox.id;
            // Get data-task attribute for unique key if ID isn't unique enough (though it should be here)
            // const dataTaskId = checkbox.getAttribute('data-task');
            const isChecked = localStorage.getItem(taskId) === 'true'; // Use taskId as key
            checkbox.checked = isChecked;
            if (isChecked) {
                // Add the completed-label class to apply strikethrough/dimming
                checkbox.nextElementSibling.classList.add('completed-label');
            }
        });
    }

    // Function to save checkbox states to localStorage
    function saveCheckboxProgress(checkboxes) {
        checkboxes.forEach(checkbox => {
            localStorage.setItem(checkbox.id, checkbox.checked); // Use checkbox ID as key
        });
    }

    // Add event listeners to all relevant checkboxes
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            // Apply/remove strikethrough class on label
            if (event.target.checked) {
                event.target.nextElementSibling.classList.add('completed-label');
            } else {
                event.target.nextElementSibling.classList.remove('completed-label');
            }

            // Save individual checkbox state
            localStorage.setItem(event.target.id, event.target.checked);

            // Update all relevant progress bars
            updateMainCourseProgress();
            updateTheoryProgress();
            updateOverallProgress(); // Overall depends on others
        });
    });

    // --- Logic for Flying Hours Tracker ---

    // Function to load saved hours
    function loadFlyingHours() {
        const savedHours = localStorage.getItem('flyingHours');
        if (savedHours) {
            flyingHoursInput.value = parseFloat(savedHours);
        }
        updateFlyingHoursProgress(); // Update progress bar based on loaded hours
    }

    // Function to update hours on button click
    updateHoursBtn.addEventListener('click', () => {
        let currentHours = parseFloat(flyingHoursInput.value);
        if (isNaN(currentHours) || currentHours < 0) {
            currentHours = 0; // Default to 0 if invalid
            flyingHoursInput.value = 0;
        }
        // Ensure hours don't exceed max
        if (currentHours > totalHoursRequired) {
            currentHours = totalHoursRequired;
            flyingHoursInput.value = totalHoursRequired;
        }

        localStorage.setItem('flyingHours', currentHours); // Save hours
        updateFlyingHoursProgress(); // Update progress bar
        updateOverallProgress(); // Update overall as well
    });

    // Also update on input change (as they type, but button click is the main save)
    flyingHoursInput.addEventListener('input', () => {
        // We only save and update on button click for hours, but this is for visual feedback while typing
        // Or you can remove this if you only want button click to update.
    });


    // --- Individual Progress Update Functions ---

    function updateMainCourseProgress() {
        loadCheckboxProgress(mainCourseCheckboxes); // Ensure states are loaded before calculating
        updateProgressBar(mainCourseCheckboxes, mainCourseProgressBarFill, mainCourseProgressPercentage, 'checkbox');
    }

    function updateTheoryProgress() {
        loadCheckboxProgress(theoryExamsCheckboxes); // Ensure states are loaded before calculating
        updateProgressBar(theoryExamsCheckboxes, theoryProgressBarFill, theoryProgressPercentage, 'checkbox');
    }

    function updateFlyingHoursProgress() {
        const currentHours = parseFloat(flyingHoursInput.value);
        updateProgressBar(null, hoursProgressBarFill, hoursProgressPercentage, 'hours', currentHours, totalHoursRequired);
    }

    // Overall Progress Function
    function updateOverallProgress() {
        // Calculate progress for each sub-tracker
        const mainCourseCompleted = Array.from(mainCourseCheckboxes).filter(cb => cb.checked).length;
        const mainCourseTotal = mainCourseCheckboxes.length;
        const mainCourseWeight = 0.4; // Example weight: Main course milestones contribute 40%

        const theoryExamsCompleted = Array.from(theoryExamsCheckboxes).filter(cb => cb.checked).length;
        const theoryExamsTotal = theoryExamsCheckboxes.length;
        const theoryExamsWeight = 0.3; // Example weight: Theory exams contribute 30%

        const currentHours = parseFloat(localStorage.getItem('flyingHours') || 0); // Get saved hours
        const hoursWeight = 0.3; // Example weight: Flying hours contribute 30%

        // Calculate weighted progress
        let weightedMainCourseProgress = (mainCourseTotal > 0) ? (mainCourseCompleted / mainCourseTotal) * mainCourseWeight : 0;
        let weightedTheoryProgress = (theoryExamsTotal > 0) ? (theoryExamsCompleted / theoryExamsTotal) * theoryExamsWeight : 0;
        let weightedHoursProgress = (totalHoursRequired > 0) ? (Math.min(currentHours, totalHoursRequired) / totalHoursRequired) * hoursWeight : 0;

        // Sum up all weighted progress to get overall progress
        const overallProgressPercentageValue = (weightedMainCourseProgress + weightedTheoryProgress + weightedHoursProgress) * 100;

        // Now update the overall progress bar using the helper function
        // Note: For overall, we are passing a "dummy" total as it's not a direct checkbox count
        updateProgressBar(null, overallProgressBarFill, overallProgressPercentage, 'overall', overallProgressPercentageValue, 100);
    }


    // --- Initial Load (run once when page loads) ---
    loadCheckboxProgress(mainCourseCheckboxes); // Load main course states
    loadCheckboxProgress(theoryExamsCheckboxes); // Load theory exam states
    loadFlyingHours(); // Load flying hours
    updateOverallProgress(); // Calculate and display overall progress based on all loaded states
});