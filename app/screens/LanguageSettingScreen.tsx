import React, { useState } from 'react';
import SelectionSettingField from '../components/SelectionSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export default function LanguageSettingScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSave = () => {
    // TODO: 在这里实现保存语言设置的逻辑
    console.log('Saving language:', selectedLanguage);
  };

  return (
    <SettingPageTemplate title="Language" onSave={handleSave}>
      <SelectionSettingField
        options={languages}
        selectedValue={selectedLanguage}
        onSelect={setSelectedLanguage}
      />
    </SettingPageTemplate>
  );
} 