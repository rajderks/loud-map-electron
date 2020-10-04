import fs from 'fs';

interface Replace {
  Regexp: string | RegExp;
  Replacer: string;
}

var replaces: Replace[] = [
  {
    Regexp: /[ \t]+/gi,
    Replacer: '',
  },
  {
    Regexp: '--.+',
    Replacer: '',
  },
  {
    Regexp: /([\w]+)=/gi,
    Replacer: "'$1'=",
  },
  {
    Regexp: /=.*['\(\}\{]+([-\d\w\/,.]+)['\)\}\{]+/gi,
    Replacer: "='$1'",
  },
  {
    Regexp: /STRING\(['"']+\)/gi,
    Replacer: '""',
  },
  {
    Regexp: /GROUP\s*\{/gi,
    Replacer: '{',
  },
  {
    Regexp: /,\r?\n}/gi,
    Replacer: '\n}',
  },
  {
    Regexp: /[\n\r]+/gi,
    Replacer: '\n',
  },
  {
    Regexp: "'",
    Replacer: `"`,
  },
  {
    Regexp: '=',
    Replacer: ':',
  },
  // {
  //   Regexp: /^\n*"Scenario":/gi,
  //   Replacer: 'var Scenario=',
  // },
  {
    Regexp: /^\n*"Scenario":/gi,
    Replacer: '',
  },
  {
    Regexp: /\[|\]/gi,
    Replacer: '',
  },
];

const parseLUA = (src: string, dst?: string) => {
  const file = fs.readFileSync(src);

  const result = replaces.reduce((acc, val) => {
    return acc.replace(
      typeof val.Regexp === 'string' ? RegExp(val.Regexp, 'gi') : val.Regexp,
      val.Replacer
    );
  }, file.toString());
  if (dst) {
    try {
      fs.unlinkSync(dst);
    } catch (e) {
      // stub
    }
  }
  if (dst) {
    fs.writeFileSync(dst, result);
    return null;
  } else {
    return result;
  }
};

export default parseLUA;
