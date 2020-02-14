# Lessons Learned

## Best Practices

1. A base type should have a `snapshot` attached to it, so that the schema of a resource type with only a `differential` can still be parsed.
2. Resources should not be duplicated by name or url.
3. Resources should be tagged with a `profile`.
4. Resource `id`s should not be randomly generated and would ideally match the name of the resource.
5. Server side caching should be turned on for faster results, and the `:missing` modifier should be implemented. Full text search using `_content` as well as searching by `ValueSet` with `valueset` should also be enabled.

## Outstanding Questions

1. Is there a way to query for resource that don't have a profile attached to them? This is useful for querying on base resource types, like `Patient` or `StructureDefinition`. If there isn't, the only way to get the number of resources conforming to these types is to query for the number of resources that have a profile attached and subtract this from the total number of resources for that base type, which is a lot of requests.
2. How would the API be utilized to get the structure of `DataTypes` like `HumanName`, `Address`, etc?
3. Is querying both `/metadata` and `SearchParameters` necessary, or is it all captured in `/metadata` (the `CapabilityStatement`)?
4. Why do `SearchParameters` sometimes display the attribute name differently than the schema? For example, `birthdate` is an acceptable `SearchParameter`, but `birthDate` is the name of the field in the schema. This causes problems when giving a table data to display.
