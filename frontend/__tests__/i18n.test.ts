/**
 * Tests for next-intl i18n configuration
 * 
 * These tests verify that:
 * 1. The i18n config file exists and exports correctly
 * 2. Messages are loaded correctly from the messages directory
 * 3. The locale is set correctly
 */

import faMessages from '../messages/fa.json';
import fs from 'fs';
import path from 'path';

describe('i18n Configuration Files', () => {
  it('should have i18n.ts file at root', () => {
    const i18nPath = path.join(__dirname, '../i18n.ts');
    expect(fs.existsSync(i18nPath)).toBe(true);
  });

  it('should have messages/fa.json file', () => {
    const messagesPath = path.join(__dirname, '../messages/fa.json');
    expect(fs.existsSync(messagesPath)).toBe(true);
  });

  it('should have next.config.ts file with next-intl plugin', () => {
    const nextConfigPath = path.join(__dirname, '../next.config.ts');
    expect(fs.existsSync(nextConfigPath)).toBe(true);
    
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
    expect(nextConfigContent).toContain('createNextIntlPlugin');
    expect(nextConfigContent).toContain('./i18n.ts');
  });
});

describe('Messages File Structure', () => {
  it('should have valid JSON structure', () => {
    expect(faMessages).toBeDefined();
    expect(typeof faMessages).toBe('object');
  });

  it('should contain Persian/Farsi text', () => {
    expect(faMessages.Home.title).toContain('لاتاری');
    expect(faMessages.Auth.login).toBe('ورود');
  });

  it('should have all required sections', () => {
    expect(faMessages).toHaveProperty('Home');
    expect(faMessages).toHaveProperty('Auth');
    expect(faMessages).toHaveProperty('Lottery');
    expect(faMessages).toHaveProperty('Games');
  });

  it('should have complete Home section', () => {
    expect(faMessages.Home).toHaveProperty('title');
    expect(faMessages.Home).toHaveProperty('description');
    expect(typeof faMessages.Home.title).toBe('string');
    expect(typeof faMessages.Home.description).toBe('string');
  });

  it('should have complete Auth section', () => {
    expect(faMessages.Auth).toHaveProperty('login');
    expect(faMessages.Auth).toHaveProperty('register');
    expect(faMessages.Auth).toHaveProperty('email');
    expect(faMessages.Auth).toHaveProperty('phone');
    expect(faMessages.Auth).toHaveProperty('password');
    expect(faMessages.Auth).toHaveProperty('firstName');
    expect(faMessages.Auth).toHaveProperty('lastName');
  });

  it('should have complete Lottery section', () => {
    expect(faMessages.Lottery).toHaveProperty('title');
    expect(faMessages.Lottery).toHaveProperty('active');
    expect(faMessages.Lottery).toHaveProperty('upcoming');
    expect(faMessages.Lottery).toHaveProperty('completed');
  });

  it('should have complete Games section', () => {
    expect(faMessages.Games).toHaveProperty('wheel');
    expect(faMessages.Games).toHaveProperty('slide');
  });
});

describe('i18n Config File Content', () => {
  it('should export getRequestConfig from next-intl/server', () => {
    const i18nPath = path.join(__dirname, '../i18n.ts');
    const i18nContent = fs.readFileSync(i18nPath, 'utf-8');
    
    expect(i18nContent).toContain('getRequestConfig');
    expect(i18nContent).toContain('next-intl/server');
    expect(i18nContent).toContain('locale');
    expect(i18nContent).toContain('messages');
    expect(i18nContent).toContain('fa');
  });

  it('should import messages from correct path', () => {
    const i18nPath = path.join(__dirname, '../i18n.ts');
    const i18nContent = fs.readFileSync(i18nPath, 'utf-8');
    
    expect(i18nContent).toContain('./messages/');
    expect(i18nContent).toContain('.json');
  });
});
