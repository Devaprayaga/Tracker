document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary DOM elements ---

    // Overall Tracker Elements
    // const allCheckboxes = document.querySelectorAll('.task-list input[type="checkbox"]'); // This isn't needed globally, better to select within update functions if necessary
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
    // Refactored to handle overall percentage directly
    function updateProgressBar(fillElement, percentageElement, type, value, total = 1) {
        let percentage = 0;
        let displayValue = "";

        if (type === 'checkbox') {
            const completedTasks = Array.from(value).filter(cb => cb.checked).length; // `value` is now the checkboxes NodeList
            const totalTasks = value.length;
            percentage = (totalTasks > 0) ? (completedTasks / totalTasks) * 100 : 0;
            displayValue = `${Math.round(percentage)}%`;
        } else if (type === 'hours') {
            percentage = (total > 0) ? (value / total) * 100 : 0; // `value` is current hours, `total` is totalHoursRequired
            displayValue = `${value} Hours`;

            // Update remaining hours text for the flying hours tracker
            if (hoursRemainingText) {
                const remaining = total - value;
                hoursRemainingText.textContent = `${Math.max(0, remaining)} Hours Remaining`;
                if (value >= total) {
                    hoursRemainingText.textContent = `${total} Hours Achieved! 🎉`;
                    hoursRemainingText.style.color = '#3CB371'; // Green when complete, use one of your theme's greens
                } else {
                    hoursRemainingText.style.color = '#BBDEFB'; // Back to theme's light blue otherwise
                }
            }
        } else if (type === 'overall') { // New logic for overall
            percentage = value; // `value` is the calculated overallProgressPercentageValue
            displayValue = `${Math.round(percentage)}%`;
        }

        fillElement.style.width = `${percentage}%`;
        percentageElement.textContent = displayValue;

        // Optional: Change color based on progress (customize for each bar if needed)
        // This makes the progress bar transition from red to yellow to green
        if (percentage < 30) {
            fillElement.style.background = 'linear-gradient(to right, #B30000, #FF6666)'; // Deep Red to Muted Red
        } else if (percentage < 70) {
            fillElement.style.background = 'linear-gradient(to right, #FFCC00, #FFEA80)'; // Rich Gold to Soft Yellow
        } else {
            fillElement.style.background = 'linear-gradient(to right, #3CB371, #66CDAA)'; // Medium Sea Green to Aqua Green
        }
    }

    // --- Logic for Checkbox Trackers (Main Course & Theory Exams) ---

    // Function to load and apply checkbox states from localStorage
    function loadCheckboxProgress(checkboxes) {
        checkboxes.forEach(checkbox => {
            const taskId = checkbox.id;
            const isChecked = localStorage.getItem(taskId) === 'true';
            checkbox.checked = isChecked;
            // Apply the strikethrough/dimming class based on loaded state
            if (isChecked) {
                checkbox.nextElementSibling.classList.add('completed-label');
            } else {
                checkbox.nextElementSibling.classList.remove('completed-label');
            }
        });
    }

    // Add event listeners to all checkboxes (main course + theory exams)
    // We can iterate over allCheckboxes if you defined it, or specifically target both lists
    // Let's use specific lists as they are already defined for clarity.
    [...mainCourseCheckboxes, ...theoryExamsCheckboxes].forEach(checkbox => {
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
            updateMainCourseProgress(); // This will re-read states and update its bar
            updateTheoryProgress();     // This will re-read states and update its bar
            updateOverallProgress();    // Overall depends on others
        });
    });


    // --- Logic for Flying Hours Tracker ---

    // Function to load saved hours
    function loadFlyingHours() {
        const savedHours = localStorage.getItem('flyingHours');
        if (savedHours) {
            flyingHoursInput.value = parseFloat(savedHours);
        } else {
            flyingHoursInput.value = 0; // Initialize to 0 if no hours saved
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
        updateFlyingHoursProgress(); // Update hours progress bar
        updateOverallProgress(); // Update overall as well
    });


    // --- Individual Progress Update Functions (called after state changes) ---

    // These functions now assume loadCheckboxProgress has already run once on page load
    // and that the checkbox states are kept up-to-date by the event listener.
    function updateMainCourseProgress() {
        updateProgressBar(mainCourseProgressBarFill, mainCourseProgressPercentage, 'checkbox', mainCourseCheckboxes);
    }

    function updateTheoryProgress() {
        updateProgressBar(theoryProgressBarFill, theoryProgressPercentage, 'checkbox', theoryExamsCheckboxes);
    }

    function updateFlyingHoursProgress() {
        const currentHours = parseFloat(localStorage.getItem('flyingHours') || 0); // Get latest saved hours
        updateProgressBar(hoursProgressBarFill, hoursProgressPercentage, 'hours', currentHours, totalHoursRequired);
    }

    // --- Overall Progress Function ---
    function updateOverallProgress() {
        // Calculate progress for each sub-tracker
        const mainCourseCompleted = Array.from(mainCourseCheckboxes).filter(cb => cb.checked).length;
        const mainCourseTotal = mainCourseCheckboxes.length;
        const mainCourseProgress = (mainCourseTotal > 0) ? (mainCourseCompleted / mainCourseTotal) : 0;
        const mainCourseWeight = 0.4; // Main course milestones contribute 40%

        const theoryExamsCompleted = Array.from(theoryExamsCheckboxes).filter(cb => cb.checked).length;
        const theoryExamsTotal = theoryExamsCheckboxes.length;
        const theoryProgress = (theoryExamsTotal > 0) ? (theoryExamsCompleted / theoryExamsTotal) : 0;
        const theoryExamsWeight = 0.3; // Theory exams contribute 30%

        const currentHours = parseFloat(localStorage.getItem('flyingHours') || 0); // Get saved hours
        const hoursProgress = (totalHoursRequired > 0) ? (Math.min(currentHours, totalHoursRequired) / totalHoursRequired) : 0;
        const hoursWeight = 0.3; // Flying hours contribute 30%

        // Sum up all weighted progress to get overall progress
        const overallProgressPercentageValue = (
            (mainCourseProgress * mainCourseWeight) +
            (theoryProgress * theoryExamsWeight) +
            (hoursProgress * hoursWeight)
        ) * 100;

        // Now update the overall progress bar using the helper function
        // Pass the calculated percentage directly
        updateProgressBar(overallProgressBarFill, overallProgressPercentage, 'overall', overallProgressPercentageValue);
    }


    // --- Initial Load (run once when page loads to restore states and update all bars) ---
    loadCheckboxProgress(mainCourseCheckboxes); // Load main course states
    loadCheckboxProgress(theoryExamsCheckboxes); // Load theory exam states
    loadFlyingHours(); // Load flying hours
    
    // Call all update functions to display initial progress for all bars
    updateMainCourseProgress();
    updateTheoryProgress();
    updateFlyingHoursProgress();
    updateOverallProgress(); // Calculate and display overall progress based on all loaded states
});