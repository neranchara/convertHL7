import type { HL7Message } from './hl7Parser';

export const toJSON = (message: HL7Message): string => {
  return JSON.stringify(message.segments, (_key, value) => {
    return value === null ? null : value;
  }, 2);
};

export const toXML = (message: HL7Message): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<HL7Message>\n';
  message.segments.forEach(seg => {
    xml += `  <${seg.name}>\n`;
    seg.fields.forEach((field, index) => {
      if (index === 0) return; // Skip segment name
      const value = field === null ? '' : field;
      // Basic XML escaping
      const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      xml += `    <Field_${index}>${escaped}</Field_${index}>\n`;
    });
    xml += `  </${seg.name}>\n`;
  });
  xml += '</HL7Message>';
  return xml;
};

export const toCSV = (message: HL7Message): string => {
  let csv = 'Segment,Field_Index,Value\n';
  message.segments.forEach(seg => {
    seg.fields.forEach((field, index) => {
      if (index === 0) return;
      const value = field === null ? '""' : `"${field.replace(/"/g, '""')}"`;
      csv += `${seg.name},${index},${value}\n`;
    });
  });
  return csv;
};

export const toHTML = (message: HL7Message): string => {
  let html = `
<div class="hl7-container">
  ${message.segments.map(seg => `
    <div class="hl7-segment">
      <h3>${seg.name}</h3>
      <table>
        <thead>
          <tr><th>Index</th><th>Value</th></tr>
        </thead>
        <tbody>
          ${seg.fields.map((field, index) => {
            if (index === 0) return '';
            return `<tr><td>${index}</td><td>${field === null ? '<span class="null">null</span>' : field}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `).join('')}
</div>`;
  return html;
};

export const toText = (message: HL7Message): string => {
  let text = 'HL7 Message Summary\n' + '='.repeat(20) + '\n\n';
  message.segments.forEach(seg => {
    text += `[${seg.name}]\n`;
    seg.fields.forEach((field, index) => {
      if (index === 0) return;
      text += `  Field ${index.toString().padStart(2, '0')}: ${field === null ? '(null)' : field}\n`;
    });
    text += '\n';
  });
  return text;
};
