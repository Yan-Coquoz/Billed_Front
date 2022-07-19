import eyeBlueIcon from "../assets/svg/eye_blue.js";
import eyeWhiteIcon from "../assets/svg/eye_white.js";

export default (billUrl, value) => {
  return `<div class="icon-actions">
        <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
        ${value ? eyeBlueIcon : eyeWhiteIcon}
        </div>
      </div>`;
};
