import { Project, Subscriber, Department } from '../types/studio';

/**
 * Replaces {{variables}} in text using subscriber data.
 */
export function interpolateMergeTags(
  text: string,
  subscriber?: Subscriber | null,
  departments: Department[] = [],
): string {
  if (!text) return '';
  if (!subscriber) {
    // Keep placeholder or provide sensible preview defaults
    return text.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (_, key) => `[${key}]`);
  }

  const dept = departments.find((d) => d.id === subscriber.departmentId);

  return text.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (match, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'name') return subscriber.name || 'Friend';
    if (lowerKey === 'email') return subscriber.email || '';
    if (lowerKey === 'role') return subscriber.role || '';
    if (lowerKey === 'department') return dept ? dept.name : 'General';
    if (lowerKey === 'status') return subscriber.status || '';

    // Check custom fields
    if (subscriber.customData && key in subscriber.customData) {
      return String(subscriber.customData[key]);
    }
    // Case-insensitive lookup in custom data
    if (subscriber.customData) {
      for (const [k, v] of Object.entries(subscriber.customData)) {
        if (k.toLowerCase() === lowerKey) return String(v);
      }
    }

    return match; // Keep unresolved tag
  });
}

/**
 * Generates email-client compatible HTML with absolute-to-percentage or cleanly stacked layout.
 */
export function generateEmailHtml(
  project: Project,
  subscriber?: Subscriber | null,
  departments: Department[] = [],
): string {
  const artboardW = project.artboardWidth || 600;
  const artboardH = project.artboardHeight || 880;
  const bg = project.artboardBackground || '#F1EEE9';

  // Sort visible elements by their layer stacking order
  const elements = project.elements.filter((e) => e.visible);

  // Find clickable hotspots to map their target URLs
  const hotspots = elements.filter((e) => e.kind === 'hotspot');

  const renderedElements = elements.map((el) => {
    const leftPct = ((el.x / artboardW) * 100).toFixed(2);
    const topPct = ((el.y / artboardH) * 100).toFixed(2);
    const widthPct = ((el.width / artboardW) * 100).toFixed(2);
    const heightPx = Math.round(el.height);

    if (el.kind === 'text') {
      const interpolated = interpolateMergeTags(el.text, subscriber, departments);
      const formattedText = interpolated.replace(/\n/g, '<br/>');

      return `
        <!-- Text: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; z-index: 10; font-family: '${el.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; color: ${el.color}; text-align: ${el.align}; line-height: ${el.lineHeight}; letter-spacing: ${el.letterSpacing}px; word-break: break-word;">
          ${formattedText}
        </div>`;
    }

    if (el.kind === 'image') {
      return `
        <!-- Image: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; overflow: hidden; border-radius: ${el.radius || 0}px;">
          <img src="${el.src}" alt="${el.alt || 'Newsletter image'}" style="width: 100%; height: 100%; object-fit: ${el.objectFit || 'cover'}; display: block; border: 0;" />
        </div>`;
    }

    if (el.kind === 'shape') {
      const isEllipse = el.shape === 'ellipse' || el.shape === 'pill';
      const radiusStyle = isEllipse ? '9999px' : `${el.radius || 0}px`;
      const borderStyle = el.borderWidth
        ? `border: ${el.borderWidth}px solid ${el.borderColor || '#DBD6D0'};`
        : '';
      const opacityStyle = el.opacity !== undefined ? `opacity: ${el.opacity};` : '';
      const rotStyle = el.rotation ? `transform: rotate(${el.rotation}deg);` : '';

      if (el.shape === 'triangle') {
        return `
        <!-- Triangle Shape: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; ${opacityStyle} ${rotStyle}">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
            <polygon points="50,0 100,100 0,100" fill="${el.fill}" />
          </svg>
        </div>`;
      }

      if (el.shape === 'star') {
        return `
        <!-- Star Shape: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; ${opacityStyle} ${rotStyle}">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
            <polygon points="50,0 63,35 100,35 70,57 82,91 50,70 18,91 30,57 0,35 37,35" fill="${el.fill}" />
          </svg>
        </div>`;
      }

      return `
        <!-- Shape: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; background-color: ${el.fill}; border-radius: ${radiusStyle}; ${borderStyle} ${opacityStyle} ${rotStyle}"></div>`;
    }

    if (el.kind === 'divider' || el.kind === 'line') {
      const lineStyle = el.style || 'solid';
      const thickness = el.thickness || 2;
      return `
        <!-- Line: ${el.name} -->
        <div style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; display: flex; align-items: center;">
          <div style="width: 100%; border-top: ${thickness}px ${lineStyle} ${el.color};"></div>
        </div>`;
    }

    if (el.kind === 'hotspot') {
      return `
        <!-- Hotspot: ${el.label} -->
        <a href="${el.href}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPx}px; display: block; z-index: 25; text-decoration: none;">
          <span style="display:none;">${el.label}</span>
        </a>`;
    }

    return '';
  });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #E9E5DE; }
    @media screen and (max-width: 640px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 32px 0; background-color: #E9E5DE; font-family: 'Instrument Sans', Arial, sans-serif;">
  <center>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${artboardW}px;" class="email-container">
      <tr>
        <td align="center" valign="top">
          <!-- Canvas Frame -->
          <div style="position: relative; width: 100%; max-width: ${artboardW}px; height: ${artboardH}px; background-color: ${bg}; overflow: hidden; box-shadow: 0 16px 40px rgba(7, 13, 13, 0.12); border-radius: 8px;">
            ${renderedElements.join('')}
          </div>
          <!-- Newsletter Standard Footer -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px;">
            <tr>
              <td align="center" style="font-size: 11px; color: #736C65; font-family: 'Instrument Sans', sans-serif; line-height: 1.5; padding: 12px 24px;">
                You are receiving this dispatch because you are part of the Lathala Studio private audience.
                <br />
                <a href="#unsubscribe" style="color: #070D0D; text-decoration: underline;">Unsubscribe</a> · 
                <a href="#preferences" style="color: #070D0D; text-decoration: underline;">Update Preferences</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
