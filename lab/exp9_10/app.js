// --- PART 3: Select and Modify a Particular Element ---
function selectAndModifyElement() {
    console.log("Running Part 3: Element Selection and Modification.");
    
    // Select the element by ID
    const targetElement = d3.select("#target-paragraph");

    // Modify properties
    targetElement.text("✅ Content Updated and Styled by D3!"); // Modify text
    targetElement.style("color", "darkgreen")
                 .style("font-size", "20px")
                 .style("font-weight", "bold");
    targetElement.attr("title", "D3 successfully modified this element."); // Modify attribute
}

// --- PART 1 & 4: Fetch Data from CSV and Populate Bar Chart ---
function createBarChartFromCSV() {
    console.log("Running Part 1 & 4: Bar Chart from CSV.");
    
    const width = 600;
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };

    const svg = d3.select("#bar-chart-container")
        .attr("width", width)
        .attr("height", height);

    // Load data from CSV
    d3.csv("data.csv").then(data => {
        // Data processing: ensure 'value' is a number
        data.forEach(d => {
            d.value = +d.value;
        });

        // 1. Define Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice() // Extends the domain to nice round numbers
            .range([height - margin.bottom, margin.top]);

        // 2. Draw Bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.category))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - margin.bottom - yScale(d.value))
            .attr("title", d => `Value: ${d.value}`); // Tooltip on hover

        // 3. Draw Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);
        
    }).catch(error => {
        console.error("Error loading CSV data:", error);
        d3.select("#bar-chart-container").append("text").attr("x", 50).attr("y", 50).text("Error loading data.");
    });
}

// --- PART 2: Create Interactive Circles and Rectangles ---
function createInteractiveControls() {
    console.log("Running Part 2: Interactive Controls.");

    const svgInteractive = d3.select("#interactive-shapes-container");

    // Create an Interactive Rectangle
    svgInteractive.append("rect")
        .attr("class", "interactive-shape")
        .attr("x", 50)
        .attr("y", 50)
        .attr("width", 100)
        .attr("height", 80)
        .attr("fill", "red")
        .on("click", function() { // Click event
            d3.select(this)
                .transition()
                .duration(500)
                .attr("transform", `rotate(${Math.random() * 360}, 100, 90)`);
            console.log("Rectangle clicked and rotated!");
        })
        .on("mouseover", function() {
            d3.select(this).attr("fill", "darkred");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "red");
        });

    // Create an Interactive Circle
    svgInteractive.append("circle")
        .attr("class", "interactive-shape")
        .attr("cx", 280)
        .attr("cy", 90)
        .attr("r", 40)
        .attr("fill", "green")
        .on("click", function() { // Click event
            const newRadius = Math.random() * 30 + 20; // Random new radius
            d3.select(this)
                .transition() // Animate the change
                .duration(700)
                .attr("r", newRadius)
                .attr("fill", d3.schemeCategory10[Math.floor(Math.random() * 10)]); // Change color
            console.log(`Circle clicked. New radius: ${newRadius.toFixed(2)}`);
        });
}

// Execute all parts when the script loads
selectAndModifyElement();
createBarChartFromCSV();
createInteractiveControls();