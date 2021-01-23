// ==UserScript==
// @name         Expand Library Radio
// @match        https://animemusicquiz.com/
// @match        https://animemusicquiz.com/?forceLogin=True
// ==/UserScript==

(function() {
    if (document.getElementById("startPage")) {
        return
    }

    addAnimationStyle()
    addExpandRadioButton()
    addRadioOverlay()
    addRadioSettings()
    loadExpandLibrary()
})()

var allAnimeSongDetailsList
var isFirstTimeLaunch = true
var shouldAutoplayAfterLoading = shouldAutoplayOnLaunch()

function loadExpandLibrary() {
    if (document.getElementById("loadingScreen").className !== "gamePage hidden") {
        setTimeout(loadExpandLibrary, 3000)
        return
    }

    let expandLibraryEntryListener = new Listener("expandLibrary questions", function (payload) {
        if (payload.success === false) {
            console.log("Failed expand library loading")
            return
        }
        updateAllAnimeSongDetailsListUsing(payload.questions)
    }).bindListener()

    socket.sendCommand({
        type: "library",
        command: "expandLibrary questions"
    })
}

function updateAllAnimeSongDetailsListUsing(animeList) {
    allAnimeSongDetailsList = []

    for (var anime of animeList) {
        let songDetailsList = songDetailsListFrom(anime)
        allAnimeSongDetailsList = allAnimeSongDetailsList.concat(songDetailsList)
    }

    if (isFirstTimeLaunch) {
        queueRandomSong()
        isFirstTimeLaunch = false
    }

    if (shouldAutoplayAfterLoading) {
        pauseOrPlay()
        shouldAutoplayAfterLoading = false
    }
}

function songDetailsListFrom(animeEntry) {
    let expandLibrarySongList = animeEntry.songs
    var animeSongDetailsList = []

    for (var expandLibrarySong of expandLibrarySongList) {
        let songDetails = songDetailsWithMp3From(expandLibrarySong)

        if (songDetails.mp3Link == null) {
            continue
        }

        songDetails.anime = animeEntry.name
        animeSongDetailsList.push(songDetails)
    }

    return animeSongDetailsList
}

function songDetailsWithMp3From(expandLibrarySong) {
    var songDetails = {
        title: expandLibrarySong.name,
        artist: expandLibrarySong.artist,
        mp3Link: expandLibrarySong.examples.mp3
    }

    return songDetails
}

function addExpandRadioButton() {
    var openRadioButton = createExpandLibraryButton()
    document.body.append(openRadioButton)
}

function addAnimationStyle() {
    var scrollingAnimationStyle = document.createElement("style")
    scrollingAnimationStyle.innerHTML = `
        @-moz-keyframes songTitleScroll {
        0%   { -moz-transform: translateX(150px); }
        100% { -moz-transform: translateX(-100%); }
        }
        @-webkit-keyframes songTitleScroll {
        0%   { -webkit-transform: translateX(150px); }
        100% { -webkit-transform: translateX(-100%); }
        }
        @keyframes songTitleScroll {
        0%   {
        -moz-transform: translateX(150px);
        -webkit-transform: translateX(150px);
        transform: translateX(150px);
        }
        100% {
        -moz-transform: translateX(-100%);
        -webkit-transform: translateX(-100%);
        transform: translateX(-100%);
        }
        }`
    document.head.append(scrollingAnimationStyle)
}

function addRadioOverlay() {
    var radioOverlay = createRadioOverlay()
    document.body.append(radioOverlay)
}

function expandRadioOverlay() {
    var radioOverlay = document.getElementById("radioOverlay")
    radioOverlay.style.visibility = "visible"

    var openRadioButton = document.getElementById("openRadioButton")
    openRadioButton.style.visibility = "hidden"
}

function collapseRadioOverlay() {
    var radioOverlay = document.getElementById("radioOverlay")
    radioOverlay.style.visibility = "hidden"

    var openRadioButton = document.getElementById("openRadioButton")
    openRadioButton.style.visibility = "visible"
}

function playRandomSong() {
    let songIndex = randomSongIndex(allAnimeSongDetailsList.length)
    play(allAnimeSongDetailsList[songIndex])
}

function queueRandomSong() {
    let songIndex = randomSongIndex(allAnimeSongDetailsList.length)
    queue(allAnimeSongDetailsList[songIndex])
}

function showPauseButton() {
    var radioPlayerPlayButtonIcon = document.getElementById("radioPlayButton").children[0]
    radioPlayerPlayButtonIcon.className = "fa fa-pause"
}

function showPlayButton() {
    var radioPlayerPlayButtonIcon = document.getElementById("radioPlayButton").children[0]
    radioPlayerPlayButtonIcon.className = "fa fa-play"
}

function pauseOrPlay() {
    let radioPlayer = document.getElementById("radioPlayer")

    if (radioPlayer.paused) {
        radioPlayer.play()
    } else {
        radioPlayer.pause()
    }
}

function randomSongIndex(songCount) {
    return Math.floor(Math.random() * (songCount))
}

function play(song) {
    var radioPlayer = document.getElementById("radioPlayer")
    queue(song)
    radioPlayer.play()
}

function queue(song) {
    var radioPlayer = document.getElementById("radioPlayer")
    radioPlayer.src = song.mp3Link

    var songInformationLabel = document.getElementById("radioSongInformationLabel")
    songInformationLabel.innerHTML = song.title + " by " + song.artist

    var popoverElement = document.getElementById("radioSongInformationWrapper")
    popoverElement.setAttribute("data-content", song.anime)
}

function openRadioSettings() {
    var radioSettingsWindow = document.getElementById("radioSettingsModal")
    radioSettingsWindow.style.display = "block"
    setTimeout(function() { radioSettingsWindow.className = "modal fade in" }, 10)

    var radioSettingsBackdrop = document.getElementById("radioSettingsBackdrop")
    radioSettingsBackdrop.style.display = "block"
    setTimeout(function() { radioSettingsBackdrop.className = "modal-backdrop fade in" }, 10)
}

function closeRadioSettings() {
    var radioSettingsWindow = document.getElementById("radioSettingsModal")
    radioSettingsWindow.className = "modal fade out"
    setTimeout(function() { radioSettingsWindow.style.display = "none" }, 500)

    var radioSettingsBackdrop = document.getElementById("radioSettingsBackdrop")
    radioSettingsBackdrop.className = "modal-backdrop fade out"
    setTimeout(function() { radioSettingsBackdrop.style.display = "none" }, 500)
}

function shouldAutoplayOnLaunch() {
    var cookieKey = "shouldAutoplayOnLaunch"
    var cookieList = document.cookie.split(";")
    var shouldAutoplayOnLaunchCookie = cookieList.find(function(cookie) {
        return cookie.includes(cookieKey)
    })

    if (shouldAutoplayOnLaunchCookie == null) {
        return false
    }

    var cookieValue = shouldAutoplayOnLaunchCookie.substring(cookieKey.length + 2)
    return cookieValue === "true"
}

function changeAutoplayOnLaunchSetting() {
    document.cookie = "shouldAutoplayOnLaunch=" + (!shouldAutoplayOnLaunch()).toString()
}

// UI Elements
function createDiv(id = "", className = "") {
    var div = document.createElement("div")
    div.id = id
    div.className = className
    return div
}

function createExpandLibraryButton() {
    var openRadioButton = createDiv("openRadioButton", "button")
    openRadioButton.style.cssText = openRadioButtonStyle()
    openRadioButton.onclick = expandRadioOverlay

    var openRadioButtonIcon = createDiv()
    openRadioButtonIcon.innerHTML = "▶"
    openRadioButtonIcon.style.cssText = openRadioButtonIconStyle()
    openRadioButton.append(openRadioButtonIcon)
    return openRadioButton
}

function createRadioOverlay() {
    var radioOverlay = createDiv("radioOverlay")
    radioOverlay.style.cssText = radioOverlayStyle()

    radioOverlay.append(createPlayerTitle())
    radioOverlay.append(createSongInformationContainer())
    radioOverlay.append(createPlayerButtons())
    radioOverlay.append(createCollapseButton())
    radioOverlay.append(createSettingsButton())
    radioOverlay.append(createRadioPlayer())
    return radioOverlay
}

function createPlayerTitle() {
    var playerTitleLabel = createDiv()
    playerTitleLabel.innerHTML = "Now Playing"
    playerTitleLabel.style.cssText = playerTitleStyle()
    return playerTitleLabel
}

function createSongInformationContainer() {
    var songInformationLabelWrapper = createDiv("radioSongInformationWrapper", "radioSongInformationWrapper")
    songInformationLabelWrapper.setAttribute("data-toggle", "popover")
    songInformationLabelWrapper.setAttribute("data-trigger", "hover")
    songInformationLabelWrapper.setAttribute("data-content", "")
    songInformationLabelWrapper.setAttribute("data-placement", "right")
    songInformationLabelWrapper.setAttribute("data-container", "body")
    songInformationLabelWrapper.style.cssText = songInformationContainerStyle()

    songInformationLabelWrapper.append(createSongInformationLabel())
    return songInformationLabelWrapper
}

function createSongInformationLabel() {
    var songInformationLabel = createDiv("radioSongInformationLabel", "radioSongInformationLabel")
    songInformationLabel.style.cssText = songInformationStyle()
    songInformationLabel.innerHTML = "Loading"
    return songInformationLabel
}

function createPlayerButtons() {
    var buttonRow = createDiv("radioButtonRow")
    buttonRow.style.cssText = playerButtonRowStyle()
    buttonRow.append(createPlayButton())
    buttonRow.append(createNextSongButton())
    return buttonRow
}

function createPlayButton() {
    var playButton = createDiv("radioPlayButton", "button")
    playButton.style.cssText = playerButtonStyle()
    playButton.onclick = pauseOrPlay

    var playButtonIcon = createDiv("playButtonIcon", "fa fa-play")
    playButtonIcon.style.cssText = playerButtonIconStyle()

    playButton.append(playButtonIcon)
    return playButton
}

function createNextSongButton() {
    var nextSongButton = createDiv("radioNextSongButton", "button")
    nextSongButton.style.cssText = playerButtonStyle()
    nextSongButton.onclick = playRandomSong

    var nextSongButtonIcon = createDiv("nextSongButtonIcon", "fa fa-fast-forward")
    nextSongButtonIcon.style.cssText = playerButtonIconStyle()

    nextSongButton.append(nextSongButtonIcon)
    return nextSongButton
}

function createCollapseButton() {
    var collapseButton = createDiv("collapseButton", "button")
    collapseButton.style.cssText = collapseButtonStyle()
    collapseButton.innerHTML = "✖"
    collapseButton.onclick = collapseRadioOverlay
    return collapseButton
}

function createSettingsButton() {
    var settingsButton = createDiv("settingsButton", "button")
    settingsButton.style.cssText = settingsButtonStyle()
    settingsButton.onclick = openRadioSettings

    var settingsButtonIcon = createDiv("settingsButtonIcon", "fa fa-cog")
    settingsButtonIcon.style.cssText = playerButtonIconStyle()

    settingsButton.append(settingsButtonIcon)
    return settingsButton
}

function createRadioPlayer() {
    var radioPlayer = document.createElement("audio")
    radioPlayer.id = "radioPlayer"
    radioPlayer.onended = playRandomSong
    radioPlayer.onplaying = showPauseButton
    radioPlayer.onpause = showPlayButton

    return radioPlayer
}

function addRadioSettings() {
    var radioSettingsWindow = createRadioSettingsWindow()
    var radioSettingBackdrop = createRadioSettingBackdrop()

    hide(radioSettingsWindow)
    hide(radioSettingBackdrop)

    document.body.append(radioSettingsWindow)
    document.body.append(radioSettingBackdrop)
}

function hide(element) {
    element.style.display = "none"
}

function createRadioSettingsWindow() {
    var radioSettingsWindow = createDiv("radioSettingsModal", "modal fade")
    radioSettingsWindow.tabindex = "-1"
    radioSettingsWindow.role = "dialog"

    var radioSettingsWindowDialog = createRadioSettingsWindowDialog()
    radioSettingsWindow.append(radioSettingsWindowDialog)

    document.body.append(radioSettingsWindow)
}

function createRadioSettingsWindowDialog() {
    var radioSettingsWindowDialog = createDiv("radioSettingsWindowDialog", "modal-dialog")
    radioSettingsWindowDialog.role = "document"
    radioSettingsWindowDialog.style.cssText = radioSettingsWindowDialogStyle()

    var radioSettingsWindowContent = createRadioSettingsWindowContent()
    radioSettingsWindowDialog.append(radioSettingsWindowContent)
    return radioSettingsWindowDialog
}

function createRadioSettingsWindowContent() {
    var radioSettingsWindowContent = createDiv("radioSettingsWindowContent", "modal-content")
    radioSettingsWindowContent.append(createRadioSettingsHeader())
    radioSettingsWindowContent.append(createRadioSettingsBody())
    return radioSettingsWindowContent
}

function createRadioSettingsHeader() {
    var header = createDiv("radioSettingsHeader", "modal-header")

    var headerCloseButton = createRadioSettingsCloseButton()
    header.append(headerCloseButton)

    var headerTitle = document.createElement("h2")
    headerTitle.className = "modal-title"
    headerTitle.innerHTML = "Radio Settings"
    header.append(headerTitle)

    return header
}

function createRadioSettingsCloseButton() {
    var headerCloseButton = createDiv("settingsHeaderCloseButton", "close")
    headerCloseButton.onclick = closeRadioSettings

    var headerCloseButtonIcon = document.createElement("span") // FIXME: can this be div
    headerCloseButtonIcon.innerHTML = "×"
    headerCloseButton.append(headerCloseButtonIcon)
    return headerCloseButton
}

function createRadioSettingsBody() {
    var settingsBody = createDiv("radioSettingsBody", "modal-body")
    settingsBody.append(createAutoplayOnLaunchSetting())
    return settingsBody
}

function createAutoplayOnLaunchSetting() {
    var autoplayOnLaunchSetting = createDiv()
    autoplayOnLaunchSetting.style.cssText = radioSettingStyle()

    var autoplayOnLaunchTitle = document.createElement("label")
    autoplayOnLaunchTitle.innerHTML = "Autoplay after loading"
    autoplayOnLaunchTitle.style.cssText = radioSettingTitleStyle()
    autoplayOnLaunchSetting.append(autoplayOnLaunchTitle)

    var checkbox = createCheckbox("autoplayOnLaunchCheckbox", shouldAutoplayOnLaunch(), changeAutoplayOnLaunchSetting)
    autoplayOnLaunchSetting.append(checkbox)

    return autoplayOnLaunchSetting
}

function createCheckbox(id, isChecked, onClick) {
    var checkboxContainer = document.createElement("div")
    checkboxContainer.className = "customCheckbox"

    var checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = id
    checkbox.checked = isChecked
    checkbox.onclick = onClick
    checkboxContainer.append(checkbox)

    var iconLabel = document.createElement("label")
    iconLabel.htmlFor = id

    var checkedIcon = document.createElement("div")
    checkedIcon.className = "fa fa-check"
    iconLabel.append(checkedIcon)
    checkboxContainer.append(iconLabel)
    return checkboxContainer
}

function createRadioSettingBackdrop() {
    var settingsBackdropFade = createDiv("radioSettingsBackdrop", "modal-backdrop fade")
    return settingsBackdropFade
}

// Styles
function openRadioButtonStyle() {
    return [
        "width: 12px",
        "height: 52px",
        "background: #424242",
        "box-shadow: 0 0 10px 2px rgb(0, 0, 0)",
        "position: absolute",
        "top: 5%"
    ].join(";")
}

function openRadioButtonIconStyle() {
    return [
        "color: #d9d9d9",
        "position: absolute",
        "top: 16px"
    ].join(";")
}

function radioOverlayStyle() {
    return [
        "width: 150px",
        "height: 52px",
        "background: rgb(66, 66, 66)",
        "box-shadow: 0 0 10px 2px rgb(0, 0, 0)",
        "position: absolute",
        "top: 5%",
        "visibility: hidden"
    ].join(";")
}

function playerTitleStyle() {
    return [
        "color: #d9d9d9",
        "text-align: center"
    ].join(";")
}

function songInformationContainerStyle() {
    return [
        "width: 90%",
        "left: 5%",
        "position: relative",
        "overflow: hidden"
    ].join(";")
}

function songInformationStyle() {
    return [
        "color: #d9d9d9",
        "white-space: nowrap",
        "font-size: 10px",
        "width: fit-content",
        "transform: translateX(100%)",
        "animation: songTitleScroll 15s linear infinite"
    ].join(";")
}

function playerButtonRowStyle() {
    return [
        "text-align: center"
    ].join(";")
}

function playerButtonStyle() {
    return [
        "width: 15px",
        "padding-left: 3px",
        "padding-right: 3px",
        "display: inline"
    ].join(";")
}

function playerButtonIconStyle() {
    return [
        "color: #d9d9d9",
        "font-size: 15px",
        "vertical-align: text-top"
    ].join(";")
}

function collapseButtonStyle() {
    return [
        "position: absolute",
        "right: 5px",
        "top: 0px"
    ].join(";")
}

function settingsButtonStyle() {
    return [
        "position: absolute",
        "right: 3px",
        "bottom: #0px"
    ].join(";")
}

function radioSettingsWindowDialogStyle() {
    return [
        "width: 300px"
    ].join(";")
}

function radioSettingStyle() {
    return [
        "display: inline-flex"
    ].join(";")
}

function radioSettingTitleStyle() {
    return [
        "padding-right: 30px",
        "padding-left: 30px"
    ].join(";")
}
