document.addEventListener("DOMContentLoaded", function () {
    let lotteryData = [];

    // Open Tabs
    function openTab(evt, tabName) {
        let tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        document.getElementById(tabName).style.display = "block";
    }
    document.querySelector(".tablink").click();

    // Modal Functions
    function showModal(id) {
        document.getElementById(id).style.display = "block";
    }
    function closeModal(id) {
        document.getElementById(id).style.display = "none";
    }
    document.querySelectorAll(".close").forEach(btn => {
        btn.addEventListener("click", function () {
            closeModal(this.parentElement.id);
        });
    });

    // File Upload & Parsing
    document.getElementById("uploadFile").addEventListener("click", function () {
        let fileInput = document.getElementById("fileInput").files[0];
        if (!fileInput) {
            alert("Please select a file.");
            return;
        }

        let reader = new FileReader();
        reader.onload = function (e) {
            let rows = e.target.result.split("\n").slice(1); // Skip headers
            lotteryData = rows.map(row => row.split(",").slice(1, 8).map(Number)); // Extract Balls 1-6 & Bonus Ball
            displayResults();
        };
        reader.readAsText(fileInput);
    });

    // Display Results
    function displayResults() {
        let resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "<h3>Uploaded Lottery Results:</h3>";
        lotteryData.forEach(draw => {
            resultsDiv.innerHTML += `<p>${draw.join(", ")}</p>`;
        });
    }

    // Number Frequency Analysis
    document.getElementById("updateAnalysis").addEventListener("click", function () {
        if (lotteryData.length === 0) {
            alert("Upload or add numbers first.");
            return;
        }

        let frequency = {};
        lotteryData.flat().forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });

        let sortedFrequency = Object.entries(frequency).sort((a, b) => b[1] - a[1]);

        document.getElementById("frequency").innerHTML = `
            <h3>Number Frequency:</h3>
            ${sortedFrequency.map(([num, count]) => `${num}: ${count} times`).join("<br>")}
        `;

        generateChart(sortedFrequency);
    });

    // Generate Chart
    function generateChart(frequencyData) {
        let ctx = document.getElementById("frequencyChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: frequencyData.map(item => item[0]),
                datasets: [{
                    label: "Frequency",
                    data: frequencyData.map(item => item[1]),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                }]
            },
        });
    }

    // Number Suggestions (6 Main Numbers + 1 Bonus)
    document.getElementById("suggestNumbers").addEventListener("click", function () {
        if (lotteryData.length === 0) {
            alert("Upload or add numbers first.");
            return;
        }

        let frequency = {};
        lotteryData.flat().forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });

        let sortedNumbers = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .map(item => parseInt(item[0]));

        if (sortedNumbers.length < 7) {
            alert("Not enough data for full number suggestions.");
            return;
        }

        let mainNumbers = sortedNumbers.slice(0, 6).sort((a, b) => a - b);
        let bonusNumber = sortedNumbers[6];

        document.getElementById("suggestionResult").innerHTML = `
            <p><strong>Suggested Main Numbers:</strong> ${mainNumbers.join(", ")}</p>
            <p><strong>Bonus Number:</strong> ${bonusNumber}</p>
        `;
    });

    // Probability Calculation
    document.getElementById("calculateProbability").addEventListener("click", function () {
        let inputNumber = parseInt(document.getElementById("probabilityNumberInput").value);
        if (isNaN(inputNumber)) {
            alert("Enter a valid number.");
            return;
        }

        let count = lotteryData.flat().filter(num => num === inputNumber).length;
        let probability = (count / lotteryData.flat().length) * 100;

        document.getElementById("probabilityResult").innerHTML = `
            <p>The number ${inputNumber} appeared ${count} times.</p>
            <p>Probability of being drawn again: ${probability.toFixed(2)}%</p>
        `;
    });

    // Generate Combinations
    document.getElementById("generateCombinations").addEventListener("click", function () {
        let length = parseInt(document.getElementById("combinationLengthInput").value);
        if (isNaN(length) || length < 1 || length > 7) {
            alert("Enter a valid combination length (1-7).");
            return;
        }

        let allNumbers = Array.from(new Set(lotteryData.flat())).sort((a, b) => a - b);
        let combinations = generateCombinations(allNumbers, length);

        document.getElementById("combinationsResult").innerHTML = `
            <h3>Generated Combinations:</h3>
            ${combinations.map(combo => combo.join(", ")).join("<br>")}
        `;
    });

    // Generate Combinations Helper Function
    function generateCombinations(arr, size) {
        let result = [];
        function combine(start, temp) {
            if (temp.length === size) {
                result.push([...temp]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                temp.push(arr[i]);
                combine(i + 1, temp);
                temp.pop();
            }
        }
        combine(0, []);
        return result.slice(0, 10); // Limit output to first 10 combinations
    }

    // Clear Combinations
    document.getElementById("clearCombinations").addEventListener("click", function () {
        document.getElementById("combinationsResult").innerHTML = "";
    });

    // Add New Numbers Manually
    document.getElementById("addNumbersButton").addEventListener("click", function () {
        let input = document.getElementById("newNumbersInput").value;
        let numbers = input.split(",").map(n => parseInt(n.trim()));

        if (numbers.length < 7 || numbers.some(n => isNaN(n))) {
            alert("Enter 6 numbers and 1 bonus number, separated by commas.");
            return;
        }

        lotteryData.push(numbers);
        displayResults();
    });

});
