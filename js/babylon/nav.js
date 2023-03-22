import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

const PARAMS = {
  cs: 0.2,
  ch: 0.2,
  walkableSlopeAngle: 90,
  walkableHeight: 1.0,
  walkableClimb: 1,
  walkableRadius: 1,
  maxEdgeLen: 12,
  maxSimplificationError: 1.3,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 1,
};

/**
 *
 * @param {import("@babylonjs/core").Scene} scene
 * @param {import("@babylonjs/core").RecastJSPlugin} nav
 * @returns {Promise<import("@babylonjs/core").ICrowd>}
 */
export function setupNav(scene, nav) {
  return new Promise((resolve) => {
    nav.createNavMesh(
      scene.getMeshesByTags("navigable"),
      PARAMS,
      (navMeshData) => {
        nav.buildFromNavmeshData(navMeshData);
        debugNavMesh(scene, nav);
        // max-agents 1 for now, treat other players as non-agents
        resolve(nav.createCrowd(1, 1, scene));
      },
    );
  });
}

/**
 *
 * @param {import("@babylonjs/core").Scene} scene
 * @param {import("@babylonjs/core").RecastJSPlugin} nav
 */
function debugNavMesh(scene, nav) {
  const navmeshdebug = nav.createDebugNavMesh(scene);
  navmeshdebug.position = new Vector3(0, 0.01, 0);

  const matdebug = new StandardMaterial("matdebug", scene);
  matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
  matdebug.alpha = 0.2;
  navmeshdebug.material = matdebug;
}
