import { describe, it, expect } from 'vitest';
import { parseHL7 } from './hl7Parser';
import { toJSON, toXML, toCSV } from './converters';

describe('HL7 Parser & Converters', () => {
  const sampleHL7 = 'MSH|^~\\&|SENDING_APP|SENDING_FAC|||202305141821||ADT^A01|123|P|2.3\nPID|||PATID123||DOE^JOHN||19800101|M|||123 MAIN ST^^CITY^ST^12345';

  it('should parse HL7 and handle empty fields as null', () => {
    const result = parseHL7(sampleHL7);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].name).toBe('MSH');
    // MSH|^~\&|SENDING_APP|...
    // fields[0] = MSH
    // fields[1] = |
    // fields[2] = ^~\&
    // fields[3] = SENDING_APP
    // fields[4] = SENDING_FAC
    // fields[5] = null (empty between SENDING_FAC||)
    expect(result.segments[0].fields[5]).toBeNull();
  });

  it('should convert to JSON correctly', () => {
    const parsed = parseHL7(sampleHL7);
    const json = toJSON(parsed);
    const jsonObj = JSON.parse(json);
    expect(jsonObj[0].fields[5]).toBeNull();
  });

  it('should convert to XML and handle null as empty string', () => {
    const parsed = parseHL7(sampleHL7);
    const xml = toXML(parsed);
    expect(xml).toContain('<Field_5></Field_5>');
  });

  it('should convert to CSV and handle null as ""', () => {
    const parsed = parseHL7(sampleHL7);
    const csv = toCSV(parsed);
    expect(csv).toContain('MSH,5,""');
  });
});
