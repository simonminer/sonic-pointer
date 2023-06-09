/**
 * Main class to support using sound to track the mouse pointer in a browser window or tab.
 */

"use strict";

// import Pizzicato from "pizzicato";
import Pizzicato from "pizzicato";
import { doc } from "prettier";

export class SoundPointer {
  minFrequency = 220;
  maxFrequency = 880;

  maxLeftPan = -1;
  maxRightPan = 1;

  minVolume = 0.1;
  maxVolume = 0.6;

  /**
   * Sound type; may be one of sine (the default), square, sawtooth, or triangle.
   * @type {String}
   */
  soundType = "sine";

  /**
   * Is the sound currently playing?
   * @type {boolean}
   */
  isSoundPlaying = false;

  /**
   * Current X and Y coordinates of the mouse.
   * @type {Object}
   */
  mousePosition = { x: undefined, y: undefined };

  /**
   * Pizzicato.Sound object used to generate sound.
   * @type {Pizzicato.Sound}
   */
  sound;

  /**
   * @returns {SoundPointer}
   */
  constructor() {
    this.sound = this.buildSound();
    document.soundPointer = this;
  }

  /**
   * Build the sound to be played using the
   * object's sound type and minimum volume.
   * @returns {Pizzicato} the PIzzicato sound object.
   */
  buildSound() {
    // Create the sound object with the object's
    // sound type and minimum volume.
    new Pizzicato.Sound();
    const sound = new Pizzicato.Sound({
      source: "wave",
      options: {
        type: this.soundType,
        volume: this.minVolume,
      },
    });
    // Add in the panner effect
    const panner = new Pizzicato.Effects.StereoPanner({
      pan: 0,
    });
    sound.addEffect(panner);

    return sound;
  }

  /**
   * Computes the left/right pan value for the current
   * horizontal position of the mouse pointer.
   * @param {int} horizontalPosition X-position in pixels
   * @returns {float}
   */
  getCurrentPan(horizontalPosition) {
    const width = window.innerWidth;
    const pan =
      (horizontalPosition / width) * (this.maxRightPan - this.maxLeftPan) +
      this.maxLeftPan;
    return parseFloat(pan.toFixed(3));
  }

  /**
   * Computes the volume level for the current
   * horizontal position of the mouse pointer.
   * @param {int} horizontalPosition X-position in pixels
   * @returns {float}
   */
  getCurrentVolume(horizontalPosition) {
    const width = window.innerWidth;
    const volume =
      (horizontalPosition / width) * (this.maxVolume - this.minVolume) +
      this.minVolume;
    return parseFloat(volume.toFixed(3));
  }

  /**
   * Computes the sound frequency for the current
   * vertical position of the mouse pointer.
   * @param {int} verticalPosition Y-position in pixels
   * @returns {int}
   */
  getCurrentFrequency(verticalPosition) {
    const height = window.innerHeight;
    // Pixels count from top to bottom of browser window,
    // so we need to reverse the ratio.
    const frequency =
      ((height - verticalPosition) / height) *
        (this.maxFrequency - this.minFrequency) +
      this.minFrequency;
    return parseInt(frequency);
  }

  /**
   * Toggles the current state of the sound from playing to
   * stopped or from stopped to playing. Returns a boolean
   * value indicating whether or not the sound is playing.
   * @returns {boolean}
   */
  toggleSound() {
    this.isSoundPlaying ? this.sound.pause() : this.sound.play();
    this.isSoundPlaying = !this.isSoundPlaying;
    return this.isSoundPlaying;
  }

  /**
   * Updates the pan position, volume, and pitch of the
   * sound based on the X and Y mouse pointer coordinates.
   * Returns the updated mouse position as an associative array
   * with "X" and "Y" entries.
   * @param {int} horizontalPosition X-position in pixels
   * @param {int} verticalPosition Y-position in pixels
   * @returns {Object}
   */
  updateSoundForMousePosition(horizontalPosition, verticalPosition) {
    this.mousePosition = { x: horizontalPosition, y: verticalPosition };

    // Adjust the pan and volume of the sound based on
    // the horizontal position of the mouse pointer.
    const pan = this.getCurrentPan(this.mousePosition.x);
    this.sound.effects[0].pan = pan;
    const volume = this.getCurrentVolume(this.mousePosition.x);
    this.sound.volume = volume;

    // Adjust the pitch of the sound based on
    // the vertical position of the mouse pointer.
    const frequency = this.getCurrentFrequency(this.mousePosition.y);
    this.sound.frequency = frequency;

    return this.mousePosition;
  }

  /**
   * Event listener function to handle the click
   * event to toggle the sound.
   */
  static handleClick() {
    document.soundPointer.toggleSound();
  }

  /**
   * Event listener function to handle mouse move
   * events that update the sound pointer tone based
   * on the mouse position.
   */
  static handleMouseMove(event) {
    document.soundPointer.updateSoundForMousePosition(
      event.clientX,
      event.clientY
    );
  }

  /**
   * Event listener to handle keyboard commands.
   * 
   * * Control+Shift+P/Command+Shift+P - Stop the sound
   * 
   */
  static handleKeyboardCommand(event) {
    // Make sure the sound stops on Ctrl/Cmd+Shift+P.
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.keyCode === 80) {
      if (document.soundPointer.isSoundPlaying) { 
        document.soundPointer.toggleSound();
      }
    }
  }

  /**
   * Configure the SoundPointer appropriately for clicking/
   * and mouse movement.
   */
  setup() {
    addEventListener("click", SoundPointer.handleClick);
    addEventListener("mousemove", SoundPointer.handleMouseMove);
    addEventListener("keydown", SoundPointer.handleKeyboardCommand);
  }


  /**
   * Cleans up the resources used by this class.
   * - Makes sure the sound has stopped playing.
   */
  teardown() { 
    if (this.isSoundPlaying) {
      this.toggleSound();
    }
    removeEventListener("click", SoundPointer.handleClick);
    removeEventListener("mousemove", SoundPointer.handleMouseMove);
  }
}