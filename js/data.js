'use strict';

function calculate_wcag(source, offset, length){
    var source = document.getElementById(source).value;
    var math = parseInt(
      length === 4
        ? source[offset / 2] + source[offset / 2]
        : source.substring(
          offset - 1,
          offset + 1
        ),
      16
    ) / 255;

    return math <= .03928
      ? math / 12.92
      : Math.pow(
        ((math + .055) / 1.055),
        2.4
      );
}

function darken_lighten(change){
    var hex = document.getElementById('hex').value;
    var hexlength = hex.length === 3;

    // Get colors.
    var blue =
      (eval(
        parseInt(
          hexlength
            ? hex.substring(2, 3) + hex.substring(2, 3)
            : hex.substring(4, 6),
          16
        )
      ) / 51) * .2;
    var green =
      (eval(
        parseInt(
          hexlength
            ? hex.substring(1, 2) + hex.substring(1, 2)
            : hex.substring(2, 4),
          16
        )
      ) / 51) * .2;
    var red =
      (eval(
        parseInt(
          hexlength
            ? hex.substring(0, 1) + hex.substring(0, 1)
            : hex.substring(0, 2),
          16
        )
      ) / 51) * .2;

    var Max = 0;
    var Min = 0;

    Max = eval(eval(red) >= eval(green)
      ? red
      : green
    );
    if(eval(blue) > eval(Max)){
        Max = eval(blue);
    }
    Min = eval(eval(red) <= eval(green)
      ? red
      : green
    );
    if(eval(blue) < eval(Min)){
        Min = eval(blue);
    }

    var H = 0;
    var L = Math.round(
      (eval(Max) + eval(Min)) * 50
    );
    var S = 0;

    // Luminosity calculations.
    L = (L + (change ? 6.25 : -6.25)) / 100;
    if(L > 1){
        L = 1;

    }else if(L < 0){
        L = 0;
    }

    if(eval(Max) != eval(Min)){
        var dx = (eval(Max) - eval(Min));
        if(red === Max){
            H = (eval(green) - eval(blue)) / dx;
        }
        if(green === Max){
            H = 2 + (eval(blue) - eval(red)) / dx;
        }
        if(blue === Max){
            H = 4 + (eval(red) - eval(green)) / dx;
        }
        S = dx
          / (L<.5
            ? eval(Max) + eval(Min)
            : 2 - eval(Max) - eval(Min)
          );
    }

    H = Math.round(H * 60);
    if(H < 0){
        H += 360;

    }else if(H >= 360){
        H -= 360;
    }

    var temp = L < .5
      ? L * (1 + S)
      : L + S - (L * S);
    var temp2 = 2 * L - temp;
    red = Math.round(
      darken_lighten_math(
        temp2,
        temp,
        H + 120
      ) * 255
    );
    green = Math.round(
      darken_lighten_math(
        temp2,
        temp,
        H
      ) * 255
    );
    blue = Math.round(
      darken_lighten_math(
        temp2,
        temp,
        H - 120
      ) * 255
    );

    document.getElementById('red-255').value =
      (red < 0 || red > 255)
        ? 0
        : red;
    document.getElementById('green-255').value =
      (green < 0 || green > 255)
        ? 0
        : green;
    document.getElementById('blue-255').value =
      (blue < 0 || blue > 255)
        ? 0
        : blue;

    update_from255('blue');
    update_from255('green');
    update_from255('red');

    update_hex();
}

function darken_lighten_math(d0, d1, d2){
    if(d2 > 360){
        d2 = d2 - 360;

    }else if(d2 < 0){
        d2 = d2 + 360;
    }

    if(d2 < 60){
        return d0 + (d1 - d0) * d2 / 60;

    }else if(d2 < 180){
        return d1;

    }else if(d2 < 240){
        return d0 + (d1 - d0) * (240 - d2) / 60;

    }else{
        return d0;
    }
}

function hexvalues(i){
    return '0123456789abcdef'.charAt(i);
}

function random_color(color){
    color = color || 'hex';

    if(color === 'hex'){
        document.getElementById(color).value = core_random_hex();
        update_fromhex();

    }else{
        document.getElementById(color).value = core_random_integer({
          'max': 256,
        });
        update_fromslider(color);
    }
}

function update_display(){
    // Set hex-color value to hex value.
    document.getElementById('hex-color').value =
      '#' + document.getElementById('hex').value;

    // Updates the display square background color.
    document.getElementById('display').style.background = 'rgb('
      + parseInt(document.getElementById('red').value, 10) + ','
      + parseInt(document.getElementById('green').value, 10) + ','
      + parseInt(document.getElementById('blue').value, 10) + ')';
}

function update_from1(color){
    // Update value of slider when 0-1 text input is changed
    //   and validate 0-1 text input value isn't less than 0 or greater than 1.
    var color_value = document.getElementById(color + '-1').value;
    if(isNaN(color_value)
      || color_value < 0
      || color_value > 1){
        color_value = 0;
        document.getElementById(color + '-1').value = color_value;
    }

    var color_value = Math.round(color_value * 255);
    document.getElementById(color).value = color_value;
    document.getElementById(color + '-255').value = color_value;
    update_display();
}

function update_from255(color){
    // Update value of slider when 0-255 text input is changed
    //   and validate 0-255 text input value is a number that isn't less than 0 or greater than 255.
    var color_value = document.getElementById(color + '-255').value;
    if(isNaN(color_value)
      || color_value < 0
      || color_value > 255){
        document.getElementById(color + '-255').value = 0;
    }

    // If 0-255 text input length is 0, just use color value of 0 instead of messing with user input.
    color_value = document.getElementById(color + '-255').value;
    document.getElementById(color).value = color_value.length < 1
      ? 0
      : color_value;
    document.getElementById(color + '-1').value = color_value.length < 1
      ? 0
      : (color_value / 255).toFixed(4);

    update_display();
}

function update_fromhex(){
    // Update values of slider/text inputs when hex input is changed.
    // Hex length of 3 is valid.
    var hex = document.getElementById('hex').value;
    var hexlength = hex.length === 3;

    document.getElementById('blue-255').value =
      parseInt(
        hexlength
          ? hex.substring(2, 3) + hex.substring(2, 3)
          : hex.substring(4, 6),
        16
      );
    document.getElementById('green-255').value =
      parseInt(
        hexlength
          ? hex.substring(1, 2) + hex.substring(1, 2)
          : hex.substring(2, 4),
        16
      );
    document.getElementById('red-255').value =
      parseInt(
        hexlength
          ? hex.substring(0, 1) + hex.substring(0, 1)
          : hex.substring(0, 2),
        16
      );

    update_from255('blue');
    update_from255('green');
    update_from255('red');

    update_display();
}

function update_fromslider(color){
    // Update values of hex and text inputs when slider is slided.
    var color_value = document.getElementById(color).value;
    document.getElementById(color + '-1').value = (color_value / 255).toFixed(4);
    document.getElementById(color + '-255').value = color_value;

    update_display();
    update_hex();
}

function update_hex(){
    // Update the hex value based on slider values.
    var red = Math.max(0, Math.min(parseInt(document.getElementById('red').value, 10), 255));
    var green = Math.max(0, Math.min(parseInt(document.getElementById('green').value, 10), 255));
    var blue = Math.max(0, Math.min(parseInt(document.getElementById('blue').value, 10), 255));

    document.getElementById('hex').value =
      hexvalues((red - red % 16) / 16) + hexvalues(red % 16)
      + hexvalues((green - green % 16) / 16) + hexvalues(green % 16)
      + hexvalues((blue - blue % 16) / 16) + hexvalues(blue % 16);

    update_display();
}

function update_wcag(source_hex, length_background, length_foreground){
    if(length_foreground === -1){
        length_foreground = length_background;
    }

    var background_math =
      (.2126 * calculate_wcag('wcag-background-color', 2, length_background)
      + .7152 * calculate_wcag('wcag-background-color', 4, length_background)
      + .0722 * calculate_wcag('wcag-background-color', 6, length_background)
    );
    var foreground_math =
      (.2126 * calculate_wcag('wcag-foreground-color', 2, length_foreground)
      + .7152 * calculate_wcag('wcag-foreground-color', 4, length_foreground)
      + .0722 * calculate_wcag('wcag-foreground-color', 6, length_foreground)
    );

    var wcag_score = Math.round(
      (Math.max(background_math, foreground_math) + .05)
      / (Math.min(background_math, foreground_math) + .05)
      * 10
    ) / 10;

    document.getElementById('wcag-text-normal-result').innerHTML =
      wcag_score + ' / 7 = AAA '
      + (wcag_score > 7
        ? 'Passed'
        : 'Failed'
      ) + '<br>' + wcag_score + ' / 4.5 = AA '
      + (wcag_score > 4.5
        ? 'Passed'
        : 'Failed'
      );
    document.getElementById('wcag-text-large-result').innerHTML =
      wcag_score + ' / 4.5 = AAA '
      + (wcag_score > 4.5
        ? 'Passed'
        : 'Failed'
      ) + '<br>' + wcag_score + ' / 3 = AA '
      + (wcag_score > 3
        ? 'Passed'
        : 'Failed'
      );

    var background = document.getElementById('wcag-background-color').value;
    var foreground = document.getElementById('wcag-foreground-color').value;
    document.getElementById('wcag-background').value = length_background === 4
      ? '#'
        + background[1] + background[1]
        + background[2] + background[2]
        + background[3] + background[3]
      : background;
    document.getElementById('wcag-foreground').value = length_foreground === 4
      ? '#'
        + foreground[1] + foreground[1]
        + foreground[2] + foreground[2]
        + foreground[3] + foreground[3]
      : foreground;
    document.getElementById('wcag-text-normal').style.backgroundColor = background;
    document.getElementById('wcag-text-normal').style.color = foreground;
    document.getElementById('wcag-text-large').style.backgroundColor = background;
    document.getElementById('wcag-text-large').style.color = foreground;
}

function wcag_set(target){
    document.getElementById('wcag-' + target + '-color').value =
      '#' + document.getElementById('hex').value;

    update_wcag(
      'wcag-' + target + '-color',
      document.getElementById('wcag-' + target + '-color').value.length,
      -1
    );
}

function wcag_switch(){
    var temp = document.getElementById('wcag-background-color').value;
    document.getElementById('wcag-background-color').value = document.getElementById('wcag-foreground-color').value;
    document.getElementById('wcag-foreground-color').value = temp;

    update_wcag(
      'wcag-background-color',
      document.getElementById('wcag-background-color').value.length,
      temp.length
    );
}