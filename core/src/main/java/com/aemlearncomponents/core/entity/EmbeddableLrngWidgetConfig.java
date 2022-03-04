package com.aemlearncomponents.core.entity;

import java.util.Collections;
import java.util.List;

public class EmbeddableLrngWidgetConfig {

	private String name;
	private String ref;
	private String widgetRef;
	private String description;
	private String type;
	private String defaultValue;
	private List<EmbeddableLrngWidgetOptions> options;

	public EmbeddableLrngWidgetConfig()
	{}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getRef()
	{
		return ref;
	}

	public void setRef(String ref)
	{
		this.ref = ref;
	}

	public String getWidgetRef()
	{
		return widgetRef;
	}

	public void setWidgetRef(String widgetRef)
	{
		this.widgetRef = widgetRef;
	}

	public String getDescription()
	{
		return description;
	}

	public void setDescription(String description)
	{
		this.description = description;
	}

	public String getType()
	{
		return type;
	}

	public void setType(String type)
	{
		this.type = type;
	}

	public List<EmbeddableLrngWidgetOptions> getOptions()
	{
		return Collections.unmodifiableList(options);
	}

	public void setOptions(List<EmbeddableLrngWidgetOptions> options)
	{
		this.options = Collections.unmodifiableList(options);
	}

	public String getDefault()
	{
		return defaultValue;
	}

	public void setDefault(String defaultValue)
	{
		this.defaultValue = defaultValue;
	}

}
