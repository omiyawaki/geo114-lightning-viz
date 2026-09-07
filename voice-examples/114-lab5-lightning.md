# Lab 5: Lightning

## 5.1: Observations of Lightning

1. Go to https://www.blitzortung.org/en/historical_maps.php?map=0
2. On the left sidebar set the date to Sep 30, 2025
3. Set the time to 0 UTC

**5.1.1** Copy and paste the map of lightning below:

**5.1.2** Describe the geographic regions where lightning is active at that point in time.

**5.1.3** Of all the regions you described in the previous question, what part of the world is lightning most active at 0 UTC? Why might this be?

## 5.2 The first ingredient of lightning

You will now download convective available potential energy (CAPE) data for the same date and time to see how CAPE relates to areas of lightning.

1. Go to https://console.cloud.google.com/storage/browser/gcp-public-data-arco-era5/raw/date-variable-single_level
2. Click on 2025 (on the next page) > 09 > 30
3. Find and click on “convective available potential energy”
4. Click on surface.nc
5. Click on Download
6. Confirm that a file named “raw_date-variable-single_level_2025_09_30_convective_available_potential_energy_surface.nc” is now available in your Downloads folder
7. Open https://colab.research.google.com/ and create a new notebook
8. Name the notebook to something descriptive and memorable (like Lab 5 Lightning)
9. Upload the .nc file that you downloaded earlier to the notebook like we did in Lab 2. Be patient because this is a larger file and will take about a minute to upload. WAIT until the upload progress bar is complete, i.e. the circular loading bar goes away. If you try to work with the file before the file is fully uploaded you will run into errors!!
10. Use AI to create a plot of convective available potential energy at 0 UTC. Make sure the plot meets the following criteria:
    1. Has coastlines (you can do this by plotting using cartopy)
    2. Is centered at 0 deg longitude (so it’s consistent with the lightning map)
    3. Axes and colorbar are properly labeled with units

**5.2.1** Once your plot is complete paste it below:

**5.2.2** Describe the geographic regions where CAPE is high.

**5.2.3** How well do regions of high CAPE align with regions where lightning is active (5.1.1)? Is high CAPE a sufficient criteria for where lightning occurs? Why or why not?

## 5.3 The second ingredient of lightning

Similar numbered steps for total precipitation download and plot, then:

**5.3.2** Describe the geographic regions of active precipitation.

**5.3.3** How well do regions of active precipitation align with regions where lightning is active (5.1.1)? Is active precipitation a sufficient criteria for where lightning occurs? Why or why not?

## 5.4 Bringing the two ingredients together

Use AI to create a plot of CAPE times precipitation at 0 UTC...

**5.4.2** Describe the geographic regions of high CAPE times precipitation.

**5.4.3** How well do regions of high CAPE times precipitation align with regions where lightning is active (5.1.1)? Why is both CAPE and precipitation necessary for lightning?
