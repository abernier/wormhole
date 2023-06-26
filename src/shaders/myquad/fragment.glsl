uniform samplerCube map1;
uniform samplerCube map2;

varying vec3 vReflect;

void main() {
  vec3 ray = normalize(vReflect);

  vec4 texColor1 = textureCube(map1, ray);
  vec4 texColor2 = textureCube(map2, ray);

  vec4 mixedColor = mix(texColor1, texColor2, .5);

  gl_FragColor = mixedColor;
}