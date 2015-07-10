var yearConfig = {
  1910: {
    fontClass: 'tk-ltc-broadway',
    motto: 'Old timey times.',
    colors: {
      background: '#F9DFAC',
      primary: '#D78B34',
      secondary: '#B4C6A5',
      tertiary: '#00807B',
      quadernary: '#BFBDBC'
    }
  },
  1920: {
    fontClass: 'tk-ten',
    motto: 'The War to End All Wars',
    colors: {
      background: '#7D3240',
      primary:    '#858532',
      secondary:  '#AD4133',
      tertiary:   '#7C3B30',
      quadernary: '#BD9570'
    }
  },
  1930: {
    fontClass: 'tk-broadway',
    motto: 'Roaring 20s. Prohibition.',
    colors: {
      background: '#D6BFBB',
      primary:    '#CDD5CF',
      secondary:  '#B5BEC6',
      tertiary:   '#CFD4C3',
      quadernary: '#CDC7C5'
    }
  },
  1940: {
    fontClass: 'tk-thirty',
    motto: 'Depression. Roosevelt. Rise of fascism.',
    colors: {
      background: '#EFB483',
      primary:    '#93441A',
      secondary:  '#BE9A73',
      tertiary:   '#B6CD94',
      quadernary: '#D6BFBB'
    }

  },
  1950: {
    fontClass: 'tk-grafolita-script',
    motto: 'Wars. Big Wars.',
    colors: {
      background: '#B4C6A5',
      primary:    '#A58374',
      secondary:  '#495C7A',
      tertiary:   '#AE2B17',
      quadernary: '#FFD6A5'
    }

  },
  1960: {
    fontClass: 'tk-clarendon-text-pro',
    motto: 'McCarthyism and the beginning of the Cold War',
    colors: {
      background: '#F1C296',
      primary:    '#AEA294',
      secondary:  '#5A9DA4',
      tertiary:   '#8FBE94',
      quadernary: '#FFDEA5'
    }

  },
  1970: {
    fontClass: 'tk-futura-pt',
    motto: 'Vietnam. Hippies. Mad Men.',
    colors: {
      background: '#F79594',
      primary:    '#BBD86B',
      secondary:  '#4BA2D1',
      tertiary:   '#86392A',
      quadernary: '#BFAB6B'
    }

  },
  1980: {
    fontClass: 'tk-cooper-black-std',
    motto: 'Groovy.',
    colors: {
      background: '#A3A76D',
      primary:    '#AEA294',
      secondary:  '#5A9DA4',
      tertiary:   '#8FBE94',
      quadernary: '#FFDEA5'
    }

  },
  1990: {
    fontClass: 'tk-eighty',
    motto: 'Computers? Arena Rock. Back to the Future',
    colors: {
      background: '#D8B4A6',
      primary:    '#D8D4CE',
      secondary:  '#EFECE6',
      tertiary:   '#FFD1AA',
      quadernary: '#9CBDBE'
    }

  },
  2000: {
    fontClass: 'tk-ninety',
    motto: 'Internet Age. Globalization.',
    colors: {
      background: '#8B493B',
      primary:    '#AEA294',
      secondary:  '#5A9DA4',
      tertiary:   '#8FBE94',
      quadernary: '#FFDEA5'
    }

  },
  2010: {
    fontClass: 'tk-aught',
    motto: 'The aughts. iPods. Iraq.',
    colors: {
      background: '#C5C2BF',
      primary:    '#A5BD84',
      secondary:  '#666699',
      tertiary:   '#EF5C30',
      quadernary: '#CBDF8C'
    }

  },
  2020: {
    fontClass: 'tk-brandon-grotesque',
    motto: 'It\'s still happening.',
    colors: {
      background: '#C5C2BF',
      primary:    '#A5BD84',
      secondary:  '#666699',
      tertiary:   '#EF5C30',
      quadernary: '#CBDF8C'
    }

  }
}

function getYearInfo(year, prop) {
  if (year < 1910) { year = 1910; } 
  else if (year < 1920) { year = 1920; } 
  else if (year < 1930) { year = 1930; } 
  else if (year < 1940) { year = 1940; } 
  else if (year < 1950) { year = 1950; } 
  else if (year < 1960) { year = 1960; } 
  else if (year < 1970) { year = 1970; } 
  else if (year < 1980) { year = 1980; } 
  else if (year < 1990) { year = 1990; } 
  else if (year < 2000) { year = 2000; } 
  else if (year < 2010) { year = 2010; } 
  else if (year < 2020) { year = 2020; } 
  return yearConfig[year][prop]; 
}

// Year functions
function getFontForYear(year) {
  var $body = document.querySelector('main');
  $body.className = getYearInfo(year, 'fontClass');
}

function getMessageForYear(year) {
  return getYearInfo(year, 'motto');
}

