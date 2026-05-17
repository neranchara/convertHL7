export type HL7Field = string | null;
export type HL7Segment = HL7Field[];
export interface HL7Message {
  segments: {
    name: string;
    fields: HL7Field[];
  }[];
}

/**
 * Parses a raw HL7 string into a structured object.
 * Handles empty fields by setting them to null.
 */
export const parseHL7 = (raw: string): HL7Message => {
  const lines = raw.split(/[\r\n]+/).filter(line => line.trim() !== '');
  const message: HL7Message = { segments: [] };

  lines.forEach(line => {
    // Special handling for MSH as the first field is the separator itself
    let fields: string[];
    const segmentName = line.substring(0, 3);
    
    if (segmentName === 'MSH') {
      const separator = line.charAt(3);
      const rest = line.substring(4);
      fields = [segmentName, separator, ...rest.split(separator)];
    } else {
      fields = line.split('|');
    }

    const processedFields: HL7Field[] = fields.map((f, i) => {
      if (i === 0) return f; // Segment name
      return f.trim() === '' ? null : f;
    });

    message.segments.push({
      name: segmentName,
      fields: processedFields
    });
  });

  return message;
};
