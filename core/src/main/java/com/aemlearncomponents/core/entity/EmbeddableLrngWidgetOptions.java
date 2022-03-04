package com.aemlearncomponents.core.entity;

import com.google.gson.annotations.SerializedName;

public class EmbeddableLrngWidgetOptions {

	private String name;
	private String description;
	private String ref;
	private String type;
	private String helpx;

	@SerializedName(value = "default")
	private String defaultValue;

	private boolean mandatory;
	private boolean hidden;

	public EmbeddableLrngWidgetOptions() {
	}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getDescription()
	{
		return description;
	}

	public void setDescription(String description)
	{
		this.description = description;
	}

	public String getRef()
	{
		return ref;
	}

	public void setRef(String ref)
	{
		this.ref = ref;
	}

	public String getType()
	{
		return type;
	}

	public void setType(String type)
	{
		this.type = type;
	}

	public String getHelpx()
	{
		return helpx;
	}

	public void setHelpx(String helpx)
	{
		this.helpx = helpx;
	}

	public String getDefaultValue()
	{
		return defaultValue;
	}

	public void setDefaultValue(String defaultValue)
	{
		this.defaultValue = defaultValue;
	}

	public boolean getMandatory()
	{
		return mandatory;
	}

	public void setMandatory(boolean mandatory)
	{
		this.mandatory = mandatory;
	}

	public boolean getHidden()
	{
		return hidden;
	}

	public void setHidden(boolean hidden)
	{
		this.hidden = hidden;
	}
}
