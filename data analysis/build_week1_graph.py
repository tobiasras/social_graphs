"""Convert week 1 TSV nodes/edges into JSON for three-forcegraph / r3f-forcegraph."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_NODES = SCRIPT_DIR / "data" / "week1_nodes.tsv"
DEFAULT_EDGES = SCRIPT_DIR / "data" / "week1_edges.tsv"
DEFAULT_OUTPUT = (
    SCRIPT_DIR.parent / "frontend" / "src" / "data" / "week1-graph.json"
)


def read_tsv_rows(path: Path) -> list[list[str]]:
    rows: list[list[str]] = []
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle, delimiter="\t")
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            rows.append(row)
    return rows


def load_nodes(path: Path) -> list[dict[str, object]]:
    rows = read_tsv_rows(path)
    if not rows:
        raise ValueError(f"No node rows found in {path}")

    header, *data_rows = rows
    expected = ["node_id", "name", "wikidata_id", "url", "description"]
    if header != expected:
        raise ValueError(f"Unexpected node header in {path}: {header}")

    nodes: list[dict[str, object]] = []
    seen: set[str] = set()
    for row in data_rows:
        if len(row) < 5:
            raise ValueError(f"Malformed node row: {row}")
        node_id, name, wikidata_id, url, description = row[:5]
        if node_id in seen:
            continue
        seen.add(node_id)
        nodes.append(
            {
                "id": node_id,
                "name": name,
                "wikidata_id": wikidata_id,
                "url": url,
                "description": description,
                "val": 1,
            }
        )
    return nodes


def load_links(path: Path, node_ids: set[str]) -> list[dict[str, str]]:
    rows = read_tsv_rows(path)
    if not rows:
        raise ValueError(f"No edge rows found in {path}")

    if rows[0][:2] == ["source", "target"]:
        rows = rows[1:]

    links: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    dropped = 0
    for row in rows:
        if len(row) < 2:
            continue
        source, target = row[0], row[1]
        if source not in node_ids or target not in node_ids:
            dropped += 1
            continue
        pair = (source, target)
        if pair in seen:
            continue
        seen.add(pair)
        links.append({"source": source, "target": target})

    if dropped:
        print(f"Dropped {dropped} links with missing endpoints")
    return links


def apply_degrees(
    nodes: list[dict[str, object]], links: list[dict[str, str]]
) -> None:
    in_degree: Counter[str] = Counter()
    out_degree: Counter[str] = Counter()
    for link in links:
        out_degree[link["source"]] += 1
        in_degree[link["target"]] += 1
    for node in nodes:
        node_id = str(node["id"])
        incoming = in_degree[node_id]
        outgoing = out_degree[node_id]
        node["inDegree"] = incoming
        node["outDegree"] = outgoing
        node["val"] = incoming + outgoing


def graph_stats(
    nodes: list[dict[str, object]], links: list[dict[str, str]]
) -> dict[str, float | int]:
    n = len(nodes)
    l = len(links)
    density = l / (n * (n - 1)) if n > 1 else 0.0
    in_degrees = [int(node["inDegree"]) for node in nodes]
    out_degrees = [int(node["outDegree"]) for node in nodes]
    isolates = sum(
        1
        for incoming, outgoing in zip(in_degrees, out_degrees)
        if incoming == 0 and outgoing == 0
    )
    edge_set = {(link["source"], link["target"]) for link in links}
    reciprocal = sum(1 for source, target in edge_set if (target, source) in edge_set)
    reciprocity = reciprocal / l if l else 0.0
    return {
        "n": n,
        "l": l,
        "density": density,
        "meanIn": sum(in_degrees) / n if n else 0.0,
        "meanOut": sum(out_degrees) / n if n else 0.0,
        "maxIn": max(in_degrees, default=0),
        "maxOut": max(out_degrees, default=0),
        "isolates": isolates,
        "reciprocity": reciprocity,
    }


def build_graph(nodes_path: Path, edges_path: Path) -> dict[str, object]:
    nodes = load_nodes(nodes_path)
    node_ids = {str(node["id"]) for node in nodes}
    links = load_links(edges_path, node_ids)
    apply_degrees(nodes, links)
    return {"nodes": nodes, "links": links, "stats": graph_stats(nodes, links)}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build week 1 force-graph JSON from TSV snapshots."
    )
    parser.add_argument("--nodes", type=Path, default=DEFAULT_NODES)
    parser.add_argument("--edges", type=Path, default=DEFAULT_EDGES)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    graph = build_graph(args.nodes, args.edges)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(graph, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {len(graph['nodes'])} nodes, {len(graph['links'])} links, "
        f"and stats to {args.output}"
    )


if __name__ == "__main__":
    main()
