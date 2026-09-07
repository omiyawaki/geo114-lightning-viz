# Lab 1: Campus Heat Mapping

Name: ________________ Date: ________________

### Learning Objectives
- Measure and map temperature variations across Union’s campus
- Connect surface types and landscape features to local temperature patterns
- Practice field data collection and visualization
- Apply knowledge about local scale heat variation using real data

### Equipment
- 13 high-precision high-refresh thermometers (10-second refresh)
- 6 low-precision low-refresh thermometers (1-minute refresh) for stationary deployment
- Phone with Google Maps
- Access to shared Google Sheets

**Contact Info if you need help**
- Professor Osamu’s number: (312) 898-3516
- Campus Safety: (518) 388-6911
- Wicker Wellness Center: (518) 388-6120

## Part 1: Predictions

Just as cities have heat islands, our campus has its own pattern of hot and cool spots. Before we measure, let's use what we learned about heat and surface properties to make predictions.

**1.1** On the campus map in the next page, mark your predictions:
- RED circles = Hottest locations
- BLUE circles = Coolest locations
- YELLOW circles = Moderate temperatures

**1.2** Choose your top prediction for each category and explain why:

**Hottest spot:** Location: ________________ Why?

**Coolest spot:** Location: ________________ Why?

## Part 2: Field Work

### Setup Phase

**2.1 Campus Zone Division** As a class, we'll divide the campus into zones to ensure complete coverage.
- Form groups of 2
- Discuss as a class how to divide up the campus into the number of groups
- Aim for roughly equal-sized zones
- Draw boundary of each group zone in the map above
- Label number to each zone

**Your group’s zone:** _____

**2.2 Planning:** Within your zone, identify
- 2-3 "must measure" spots
- Good locations for stationary thermometers (metal posts/signs)
- A logical route to cover your zone efficiently

**2.3** Open the shared Google Sheets on your phone:
Monday Lab: http://bit.ly/41DpQQc
Tuesday Lab: http://bit.ly/3Ieobdd

### Measurement Protocol
- Shade thermometer from sun (use body, clipboard, mount on shade side of pole, etc)
- Wave gently in air for faster equilibration
- Hold around chest height (~1.5 meters)
- Wait for reading to stabilize

### Getting Coordinates
1. Open Google Maps on your phone
2. Press and hold at your exact location you’re measuring to drop a pin
3. Coordinates should appear on the search bar
4. Copy coordinates (example: 42.816229, -73.929056)

### Data Entry Format
For each measurement, enter in Google Sheets:
- group_number: Your group’s number (i.e., 1, 2, 3, etc)
- location_id: Descriptive name (e.g., "rugby_field" or "jackson_garden_path")
- point_latitude: First number from coordinates (will be positive)
- point_longitude: Second number (will be negative)
- temperature: Reading to nearest 0.1°F for high precision, nearest 1°F for low precision thermometer
- surface_type: short description of the surface type
- other_notes: any other notes worth mentioning, e.g. shaded, near exhaust vent, etc.

### Collection Strategy
**Phase A: Deploy Stationary Thermometers** Place low-precision thermometers in 1-2 interesting spots where they can attach to metal (sign posts, railings). Note locations below so you don’t forget where you’ve placed them as you proceed with phase B:
Location 1: ________________ Location 2 (if applicable): ________________

**Phase B: Roaming Measurements** Using your high-precision thermometer, collect at least 15 measurements within your zone. Aim for variety:
- Different surface types (asphalt, grass, mulch, concrete)
- Sun vs. shade
- Near buildings vs. open areas
- Different heights if possible (ground level vs. raised areas)

**Phase C: Retrieve Stationary Thermometers** Return to collect final readings from your deployed stationary thermometers.

**Phase D: Return to Olin 332** to continue with the rest of the lab.

## Part 3: Visualization and Analysis

### Creating Your Heat Map
Navigate to the shared Google Sheets on your laptop. Then,

**3.1** Download the data as a csv file:
1. In Google Sheets: File → Download → CSV
2. Save with clear name (e.g., "campus_heat_data.csv")

**3.2** Upload to kepler.gl:
1. Go to kepler.gl/demo
2. Drag your CSV file into the window

**3.3** Setup the visualization:
- Click on the “v” icon to access more settings for the data layer
- Scroll down to the fill color setting, click on Select a field and select temperature:
- Now your points should be colored according to the temperature values that were collected.
- Customize the color scale until you are satisfied with the visual clarity and aesthetic design of the map.

**3.4** Take a screenshot of your completed map and upload it to the Google Drive below. Make sure to label the screenshot file with your name!
http://bit.ly/3VBzwXN

### Analysis
**3.5** Compare your prediction map to the actual data. Circle one: My predictions were
Very Accurate / Somewhat Accurate / Pretty Different / Completely Wrong

**3.6** What was your biggest surprise in the data? Can you make sense of the result?

**3.7** Identify the hottest and coolest spots from the actual data:
Hottest location: ________________ Temperature: _____ °F
Why do you think this spot was hottest?

Coolest location: ________________ Temperature: _____ °F
Why do you think this spot was the coolest?

**3.8** What was the total temperature range across campus? _____ °F
Is this bigger or smaller than you expected? ________________

## PART 4: Deeper Thinking (30 minutes)

**4.1** Based on your data, identify one spot on campus where adding shade would have the biggest impact for student comfort:
Location: ________________
Justification: ________________

**4.2** Look at your heat map and find one pattern you can't fully explain. Write it as a question:
________________
This could become a curiosity log topic!

**4.3** A prospective student asks: "Where's the best outdoor spot to study on hot days?" Based on your data and other factors you didn't measure (like seating, noise, etc.), what would you recommend?

### Lab Report Requirements (Due before next lab)
1. Your completed lab sheet
2. Screenshot of your final kepler.gl heat map (upload to the Google drive link listed above, make sure the file has your name in it)
