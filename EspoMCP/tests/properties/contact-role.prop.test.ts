/**
 * Property-based test for formatContactDetails cRole inclusion.
 *
 * **Validates: Requirements 3.4**
 *
 * Property 3: For any Contact object where cRole is a non-empty string,
 * the output of formatContactDetails SHALL contain the substring
 * "Role: {cRole value}".
 */

import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { formatContactDetails } from '../../src/utils/formatting';
import type { Contact } from '../../src/espocrm/types';

// --- Generators ---

/** Generates a non-empty string for cRole */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

/** Generates a valid Contact with required fields and a non-empty cRole */
const contactWithRoleArb: fc.Arbitrary<Contact> = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  cRole: nonEmptyStringArb,
  emailAddress: fc.option(fc.emailAddress(), { nil: undefined }),
  phoneNumber: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  accountName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  department: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
});

/** Generates a Contact without cRole (undefined or empty) */
const contactWithoutRoleArb: fc.Arbitrary<Contact> = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  emailAddress: fc.option(fc.emailAddress(), { nil: undefined }),
  phoneNumber: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

// --- Property 3: formatContactDetails includes cRole ---

describe('Property 3: formatContactDetails cRole inclusion', () => {
  const NUM_RUNS = 100;

  /**
   * **Validates: Requirements 3.4**
   *
   * For any Contact with non-empty cRole, output contains "Role: {cRole}".
   */
  it('output contains "Role: {cRole}" when cRole is a non-empty string', () => {
    fc.assert(
      fc.property(contactWithRoleArb, (contact) => {
        const result = formatContactDetails(contact);
        expect(result).toContain(`Role: ${contact.cRole}`);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  /**
   * When cRole is absent, the output should NOT contain "Role:".
   */
  it('output does not contain "Role:" when cRole is absent', () => {
    fc.assert(
      fc.property(contactWithoutRoleArb, (contact) => {
        const result = formatContactDetails(contact);
        expect(result).not.toContain('Role:');
      }),
      { numRuns: NUM_RUNS },
    );
  });

  /**
   * The output always starts with "Contact Details:" header.
   */
  it('output always starts with "Contact Details:" header', () => {
    fc.assert(
      fc.property(contactWithRoleArb, (contact) => {
        const result = formatContactDetails(contact);
        expect(result).toMatch(/^Contact Details:/);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  /**
   * The output always contains the contact's full name.
   */
  it('output always contains the contact name', () => {
    fc.assert(
      fc.property(contactWithRoleArb, (contact) => {
        const result = formatContactDetails(contact);
        expect(result).toContain(`Name: ${contact.firstName} ${contact.lastName}`);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
