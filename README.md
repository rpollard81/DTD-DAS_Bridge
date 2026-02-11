# DTD-DAS_Bridge
Populates DAS Trader montage window when a symbol is selected in Day Trade Dash

## On computer the runs the browser for Day Trade Dash
  - Install and setup the TamperMonkey extension for the browser that runs DTD
	  - Instructions for Chrome:
		  - Go to "https://chromewebstore.google.com/category/extensions" and search for "TamperMonkey"
		  - Click on the first result. It will show over 11 million users.
		  - Click "Add to Chrome" and allow it to install by confirming in the popup
		  - Click on the extensions icon in the toolbar and look for TamperMonkey
		  - Click the thumbtack icon to pin the extension to the toolbar
		  - Right click on the TamperMonkey icon and select "Manage Extension"
		  - In the window that opens, you need to enable 2 options - "Developer Mode" and "Allow User Scripts"
		  - Optionally, in "Site Access", you can select "On specific sites" from the dropdown list and add "https://*.warriortrading.com". That way it only runs for that website
		  - Open or refresh the Warrior Trading Day Trade Dash website, then click on the TamperMonkey icon in the toolbar. It may ask you to reload the site to enable it. Once it is enabled for the website, you should see a green check mark in the dropdown
		  - In the TamperMonkey dropdown, select "Create new script" and paste the full contents of the "DTD to DAS Bridge.user.js" file into the window that opens
		  - If, like me, you are running Chrome on Mac and DAS in a Windows VM, you will need to set the DAS_HOST_IP_ADDRESS constant in the script to the IP address of the Windows VM. Save the script and close the editor
			  - To get the IP address of a Windows VM, search for and open the Terminal app in Windows, and send the "ipconfig" command. You will see the IP address in the output of the command
		  - Close the TamperMonkey editor window, then click on the icon in the toolbar and select "Dashboard". Verify that the new script is enabled. Once you've done this, you can close the dashboard
		  - Now go back to Day Trade Dash and refresh the page. You should see a popup asking for permission for the DTD to DAS Bridge script to run. Approve it.
		  - Next you will see a TamperMonkey window open that says "A userscript wants to access a cross-origin resource." at the top. This screen will time out after 20 seconds, so if that happens, the script will be blocked and you will need to refresh Day Trade Dash to see it again. You have a few options here:
			  - Allow once: If you choose this option, you will see this screen each time you select a ticker symbol in Day Trade Dash. Not ideal.
			  - Temporarily allow: This option will grant permission for the entire Day Trade Dash session. If you refresh the page or log out and back in, you will need to grant permission again. Probably a good option if you do not frequently refresh the page.
			  - Always allow: This will grant permission for the script to run each time you use Day Trade Dash.
		  - The previous step will show several confirmation popups that you have to approve
		  - At this point, everything should be setup on the web browser side. You can verify that it is working by opening Chrome Developer Tools, then selecting the Console tab. If you click on a ticker symbol in Day Trade Dash, you should see it printed in the Console window. If so, you can close Developer Tools

## On the computer that runs DAS Trader
### In DAS Trader
  - In Setup -> Other Configuration:
	  - Set the CMD API Port to 5566
	  - Click the checkbox for Disable Logon Check (Login is only required for trades, but we just want to populate the montage window with our ticker symbol)
	  - Save and exit configuration
  - Right click on the title bar of the montage window, and in the configuration popup, give it a name. I used "DasMontage"
  - Restart DAS Trader
  - You should get a Windows firewall warning, asking if you want to allow incoming connections to DAS. Approve this or nothing will work

*The script that bridges the browser script to the DAS Trader API runs in NodeJS. Here's the easiest way to set it up:
### Copy script file to a location on your computer
  - Create a folder called "dtd-bridge" in C:/
  - Copy the bridge-server.js to the folder
  - If you chose a different name than I did for your DAS montage window, edit the MONTAGE_WINDOW_NAME constant in the script and save it
### Install nvm-windows
  - Get nvm-windows from here and install it: https://github.com/coreybutler/nvm-windows
### Install node.js
  - Launch PowerShell in Terminal. PowerShell should be the default when you launch Terminal.
  - Enable scripts:
	Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  - Run the following commands:
	nvm install lts
	nvm use lts
	node -v
	npm -v
  - The -v commands above should return version numbers if everything is installed correctly
### Start the bridge server
  - Start the server by running these commands from the same Terminal or a new one:
	cd C:\dtd-bridge
	npm init -y
	npm install express
	node ./bridge-server.js
  - Allow incoming connection in the popup
### Test end-to-end
  - At this point, everything should be setup. If you select a ticker symbol in Day Trade Dash, TamperMonkey will forward it to the server running in NodeJS, and that server will set the DAS montage window's ticker symbol using the DAS CMD API