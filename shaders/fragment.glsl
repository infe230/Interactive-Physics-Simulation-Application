#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_fragPos;
in vec2 v_texCoord;
in vec4 v_fragPosLightSpace;

uniform vec3 u_viewPos;
uniform sampler2D u_texture;
uniform sampler2D u_shadowMap;

struct DirectionalLight {
  vec3 direction;
  vec3 color;
};

uniform DirectionalLight u_light;

out vec4 FragColor;

float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
  // Perform perspective divide
  vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
  // Transform to [0,1] range
  projCoords = projCoords * 0.5 + 0.5;
  // Get closest depth value from light's perspective (using shadow map)
  float closestDepth = texture(u_shadowMap, projCoords.xy).r;
  // Get depth of current fragment from light's perspective
  float currentDepth = projCoords.z;
  // Check whether current fragment is in shadow
  float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
  float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
  if (projCoords.z > 1.0)
    shadow = 0.0;
  return shadow;
}

void main() {
  // Properties
  vec3 color = texture(u_texture, v_texCoord).rgb;
  vec3 normal = normalize(v_normal);
  vec3 lightColor = u_light.color;

  // Ambient
  vec3 ambient = 0.1 * lightColor;

  // Diffuse
  vec3 lightDir = normalize(-u_light.direction);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  // Specular
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = spec * lightColor;

  // Shadow
  float shadow = ShadowCalculation(v_fragPosLightSpace, normal, lightDir);

  vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;

  FragColor = vec4(lighting, 1.0);
}
